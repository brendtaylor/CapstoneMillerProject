const { AppDataSource } = require("../data-source");
const { emitToMake } = require("../utils/makeEmitter"); 
const { EventEmitter } = require("events"); 
const logger = require("../../logger");

class TicketService {
    constructor() {
        this.ticketRepository = AppDataSource.getRepository("Ticket");
        this.archivedRepository = AppDataSource.getRepository("ArchivedTicket");
        this.workOrderRepository = AppDataSource.getRepository("WorkOrder");
        this.closureRepository = AppDataSource.getRepository("TicketClosure"); 
        this.noteRepository = AppDataSource.getRepository("Note");
        this.auditRepository = AppDataSource.getRepository("AuditLog");
        this.sseEmitter = new EventEmitter(); 
        logger.info("TicketService initialized");
    
        // Standard relations for ACTIVE tickets
        this.relations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo", "files",
            "closures", "closures.closedBy"
        ];

        // Relations for ARCHIVED tickets
        this.archiveRelations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo"
        ];
    }

    async getAllTickets() {
        logger.info("Fetching all tickets");
        return await this.ticketRepository.find({
            relations: this.relations
        });
    }

    async getTicketById(id) {
        logger.info(`Fetching ticket by ID: ${id}`);
        const ticket = await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: this.relations
        });
        if (!ticket) {
            logger.warn(`Ticket ID ${id} not found`);
        }
        return ticket;
    }

    async createTicket(ticketData) {
        logger.info("Creating new ticket with transaction");
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) throw new Error(`Work Order with ID ${ticketData.wo} not found.`);
            const woNumber = workOrder.wo;

            const activeCount = await queryRunner.manager.count("Ticket", { where: { wo: { woId: ticketData.wo } } });
            const archivedCount = await queryRunner.manager.count("ArchivedTicket", { where: { wo: { woId: ticketData.wo } } });

            const totalCount = activeCount + archivedCount;
            const newTicketNum = (totalCount + 1).toString().padStart(3, '0');
            const qualityTicketId = `${woNumber}-${newTicketNum}`;

            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId,
                openDate: new Date(),
                status: 0, 
            });
            
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            const completeTicket = await this.getTicketById(savedTicket.ticketId);
            this.sseEmitter.emit('new-ticket', completeTicket); 
            this.triggerWebhook('ticket.create', completeTicket);
            
            return completeTicket;

        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            logger.error(`Error in createTicket transaction: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateTicket(id, ticketData) {
        logger.info(`Updating ticket ID: ${id}`);
        const { status, assignedTo, ...allowedUpdates } = ticketData;

        await this.ticketRepository.update(id, allowedUpdates);
        
        const updatedTicket = await this.getTicketById(id);
        this.sseEmitter.emit('update-ticket', updatedTicket); 
        this.triggerWebhook('ticket.update', updatedTicket);
        
        logger.info(`Ticket ${id} updated (General Fields)`);
        return updatedTicket;
    }

    async updateTicketStatus(id, newStatus, extraData, user) {
        logger.info(`Updating Status for ticket ID: ${id} to ${newStatus}`);

        const currentTicket = await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: ["status", "wo", "closures"] 
        });

        if (!currentTicket) throw new Error("Ticket not found");

        const currentStatusId = currentTicket.status?.statusId;

        // Logic for Closing
        if (newStatus === 2 && currentStatusId !== 2) {
             const cycleStart = currentTicket.lastReopenDate || currentTicket.openDate;
             
             const closureRecord = this.closureRepository.create({
                ticket: { ticketId: id },
                cycleStartDate: cycleStart,
                cycleCloseDate: new Date(),
                correctiveAction: extraData.correctiveAction, 
                materialsUsed: extraData.materialsUsed,       
                estimatedLaborHours: extraData.estimatedLaborHours, 
                closedBy: { id: user.id } 
            });
            await this.closureRepository.save(closureRecord);
        }

        // Logic for Re-opening
        let updatePayload = { status: newStatus };
        if (newStatus !== 2 && currentStatusId === 2) {
            updatePayload.lastReopenDate = new Date();
        }
        if (newStatus === 2) {
            updatePayload.closeDate = new Date();
        }

        await this.ticketRepository.update(id, updatePayload);
        
        await this.logAudit(user, id, currentTicket.wo?.woId, `Updated Status to ${newStatus}`);

        const updatedTicket = await this.getTicketById(id);
        this.sseEmitter.emit('update-ticket', updatedTicket); 
        this.triggerWebhook('ticket.update', updatedTicket);

        return updatedTicket;
    }

    async assignTicketUser(id, targetUserId, actingUser) {
        logger.info(`Assigning ticket ${id} to user ${targetUserId}`);

        await this.ticketRepository.update(id, { assignedTo: targetUserId });

        await this.logAudit(actingUser, id, null, `Assigned User ${targetUserId} to Ticket`);

        const updatedTicket = await this.getTicketById(id);
        this.sseEmitter.emit('update-ticket', updatedTicket);
        this.triggerWebhook('ticket.update', updatedTicket);

        return updatedTicket;
    }

    async deleteTicket(id) {
        logger.info(`Archiving ticket ID: ${id}`);
        const ticketToArchive = await this.getTicketById(id);
        if (!ticketToArchive) throw new Error("Ticket not found");

        const archivedTicket = this.archivedRepository.create(ticketToArchive);
        await this.archivedRepository.save(archivedTicket);
        await this.ticketRepository.delete(id);
        
        this.sseEmitter.emit('delete-ticket', { id: parseInt(id, 10) }); 
        return { id: id, message: "Ticket archived successfully" };
    }

    async logAudit(user, ticketId, woId, action) {
        try {
            const log = this.auditRepository.create({
                userId: user.id,
                userRole: user.role,
                ticketId: ticketId,
                woId: woId,
                action: action,
                timestamp: new Date()
            });
            await this.auditRepository.save(log);
        } catch (err) {
            logger.error(`Failed to create audit log: ${err.message}`);
        }
    }

    async triggerWebhook(event, payload) {
        try {
            const makeRs = await emitToMake(event, { ticket: payload });
            if (makeRs?.status === 'success' || makeRs === 'Accepted') {
                logger.info(`Webhook sent for ${event}`);
            }
        } catch (err) {
            logger.error(`Failed to emit webhook: ${err.message}`);
        }
    }

    async getAllArchivedTickets() {
        return await this.archivedRepository.find({ relations: this.archiveRelations });
    }

    async getArchivedTicketById(id) {
        return await this.archivedRepository.findOne({
            where: { ticketId: parseInt(id) },
            relations: this.archiveRelations 
        });
    }

    async connectSSE(req, res) {
        logger.info("SSE client connected");
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); 

        const sendEvent = (event, data) => {
            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        const newTicketHandler = (data) => sendEvent('new-ticket', data);
        const updateTicketHandler = (data) => sendEvent('update-ticket', data);
        const deleteTicketHandler = (data) => sendEvent('delete-ticket', data);

        this.sseEmitter.on('new-ticket', newTicketHandler);
        this.sseEmitter.on('update-ticket', updateTicketHandler);
        this.sseEmitter.on('delete-ticket', deleteTicketHandler);

        req.on('close', () => {
            this.sseEmitter.removeListener('new-ticket', newTicketHandler);
            this.sseEmitter.removeListener('update-ticket', updateTicketHandler);
            this.sseEmitter.removeListener('delete-ticket', deleteTicketHandler);
        });
    }

    async getNotesByTicketId(ticketId) {
        return await this.noteRepository.find({
            where: { ticket: { ticketId: parseInt(ticketId) } },
            relations: ["author"],
            order: { createdAt: "DESC" }
        });
    }

    async addNote(ticketId, noteText, authorId) {
        const note = this.noteRepository.create({
            text: noteText,
            ticket: { ticketId: parseInt(ticketId) },
            author: { id: parseInt(authorId) },
            createdAt: new Date()
        });
        await this.noteRepository.save(note);
        return await this.noteRepository.findOne({ where: { noteId: note.noteId }, relations: ["author"] });
    }
}

module.exports = new TicketService();