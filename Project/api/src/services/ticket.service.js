const { AppDataSource } = require("../data-source");
const { emitToMake } = require("../utils/makeEmitter"); 
const logger = require("../../logger");

class TicketService {
    constructor() {
        this.ticketRepository = AppDataSource.getRepository("Ticket");
        this.archivedRepository = AppDataSource.getRepository("ArchivedTicket");
        this.workOrderRepository = AppDataSource.getRepository("WorkOrder");
        this.closureRepository = AppDataSource.getRepository("TicketClosure"); 
        this.noteRepository = AppDataSource.getRepository("Note");
        this.auditRepository = AppDataSource.getRepository("AuditLog");
        
        // Set of response objects
        this.clients = new Set();

        // Sends a comment line every 30 seconds to keep connections open
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 30000);
        
        logger.info("TicketService initialized");
    
        this.relations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo", 
            "closures", "closures.closedBy"
        ];

        this.archiveRelations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo"
        ];
    }

    // --- SSE HELPER METHODS ---

    /**
     * Sends a 'ping' comment to all clients to prevent timeouts.
     * SSE comments start with a colon (:).
     */
    sendHeartbeat() {
        this.clients.forEach(client => {
            if (client.writable) {
                client.write(': ping\n\n');
            }
        });
    }

    /**
     * Broadcasts a JSON event to all connected clients.
     */
    broadcast(event, data) {
        const message = `event: ${event}\n` +
                        `data: ${JSON.stringify(data)}\n\n`;

        this.clients.forEach(client => {
            if (client.writable) {
                client.write(message);
            } else {
                // Cleanup dead connections
                this.clients.delete(client);
            }
        });
    }

    async connectSSE(req, res) {
        // Standard SSE Headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Nginx buffering can block SSE; this header disables it
        res.setHeader('X-Accel-Buffering', 'no'); 
        res.flushHeaders(); 

        // Add client to set
        this.clients.add(res);
        logger.info(`SSE Client Connected. Total clients: ${this.clients.size}`);

        // Handle disconnect
        req.on('close', () => {
            this.clients.delete(res);
            logger.info(`SSE Client Disconnected. Total clients: ${this.clients.size}`);
            res.end();
        });
    }

    // --- SERVICE METHODS (Updated to use broadcast) ---

    async getAllTickets() {
        return await this.ticketRepository.find({
            relations: this.relations
        });
    }

    async getTicketById(id) {
        return await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: this.relations
        });
    }

    async createTicket(ticketData) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) throw new Error(`Work Order ID ${ticketData.wo} not found.`);
            const woNumber = workOrder.wo;

            // Atomic Counter for ID Generation 
            await queryRunner.query(`
                IF NOT EXISTS (SELECT 1 FROM Ticket_Counters WHERE WO_ID = @0)
                INSERT INTO Ticket_Counters (WO_ID, LAST_TICKET_NUM) VALUES (@0, 0)
            `, [ticketData.wo]);

            const counterResult = await queryRunner.query(`
                UPDATE Ticket_Counters
                SET LAST_TICKET_NUM = LAST_TICKET_NUM + 1
                OUTPUT INSERTED.LAST_TICKET_NUM
                WHERE WO_ID = @0
            `, [ticketData.wo]);

            const nextSeqNum = counterResult[0].LAST_TICKET_NUM;
            const qualityTicketId = `${woNumber}-${nextSeqNum.toString().padStart(3, '0')}`;

            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId,
                openDate: new Date(),
                status: 0, 
            });
            
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            const completeTicket = await this.getTicketById(savedTicket.ticketId);
            
            this.broadcast('new-ticket', completeTicket); 
            this.triggerWebhook('ticket.create', completeTicket);
            
            return completeTicket;

        } catch (error) {
            if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
            logger.error(`Error in createTicket: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateTicket(id, ticketData) {
        const { status, assignedTo, ...allowedUpdates } = ticketData;

        await this.ticketRepository.update(id, allowedUpdates);
        
        const updatedTicket = await this.getTicketById(id);
    
        this.broadcast('update-ticket', updatedTicket); 
        this.triggerWebhook('ticket.update', updatedTicket);
        
        return updatedTicket;
    }

    async updateTicketStatus(id, newStatus, extraData, user) {
        const currentTicket = await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: ["status", "wo", "closures"] 
        });

        if (!currentTicket) throw new Error("Ticket not found");

        const currentStatusId = currentTicket.status?.statusId;

        // Closing Logic
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

        // Re-opening Logic
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
        
        this.broadcast('update-ticket', updatedTicket); 
        this.triggerWebhook('ticket.update', updatedTicket);

        return updatedTicket;
    }

    async assignTicketUser(id, targetUserId, actingUser) {
        await this.ticketRepository.update(id, { assignedTo: targetUserId });
        await this.logAudit(actingUser, id, null, `Assigned User ${targetUserId} to Ticket`);

        const updatedTicket = await this.getTicketById(id);
        
        this.broadcast('update-ticket', updatedTicket);
        this.triggerWebhook('ticket.update', updatedTicket);

        return updatedTicket;
    }

    async deleteTicket(id) {
        const ticketToArchive = await this.getTicketById(id);
        if (!ticketToArchive) throw new Error("Ticket not found");

        const archivedTicket = this.archivedRepository.create(ticketToArchive);
        await this.archivedRepository.save(archivedTicket);
        await this.ticketRepository.delete(id);
        
        this.broadcast('delete-ticket', { id: parseInt(id, 10) }); 
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