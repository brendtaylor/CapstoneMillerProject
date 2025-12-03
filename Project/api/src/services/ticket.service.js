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
        this.sseEmitter = new EventEmitter(); 
        logger.info("TicketService initialized");
    
        // Define standard relations
        this.relations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo", "files",
            "closures", "closures.closedBy"
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
            // Get WO number for Quality Ticket ID generation
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) {
                throw new Error(`Work Order with ID ${ticketData.wo} not found.`);
            }
            const woNumber = workOrder.wo;

            // Generate Quality Ticket ID
            // Count Active Tickets for this WO
            const activeCount = await queryRunner.manager.count("Ticket", {
                where: { wo: { woId: ticketData.wo } } 
            });

            // Count Archived Tickets for this WO
            const archivedCount = await queryRunner.manager.count("ArchivedTicket", {
                where: { wo: { woId: ticketData.wo } } 
            });

            // Add them together so archiving doesn't reset the sequence
            const totalCount = activeCount + archivedCount;
            const newTicketNum = (totalCount + 1).toString().padStart(3, '0');
            
            const qualityTicketId = `${woNumber}-${newTicketNum}`;
            logger.info(`Generated new Quality Ticket ID: ${qualityTicketId}`);

            // Create Ticket
            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId,
                openDate: new Date(),
                status: 0,
            });
            
            // Save the raw ticket
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            // FETCH COMPLETE TICKET 
            // fetch the full entity with relations so the UI receives { wo: { woId: ... } }
            const completeTicket = await this.getTicketById(savedTicket.ticketId);

            // Emit Events using the COMPLETE ticket
            this.sseEmitter.emit('new-ticket', completeTicket); 
            
            try {
                const makeRs = await emitToMake('ticket.create', { ticket: completeTicket });
        
                // Check for success signal from Make.com
                if (makeRs?.status === 'success' || makeRs === 'Accepted') {
                    logger.info(`Email sent successfully for ticket.create`);
                } else {
                    logger.warn(`Email webhook sent, but Make returned: ${JSON.stringify(makeRs)}`);
                }
            } catch (err) {
                logger.error(`Failed to emit new-ticket webhook: ${err.message}`);
            }
            
            logger.info(`Ticket created with ID: ${savedTicket.qualityTicketId}`);
            return completeTicket;

        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            logger.error(`Error in createTicket transaction: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateTicket(id, ticketData) {
        logger.info(`Updating ticket ID: ${id}`);
        
        // Fetch the current state of the ticket to check for status transitions
        const currentTicket = await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: ["closures"] 
        });

        if (!currentTicket) {
            logger.error(`Ticket ${id} not found.`);
            throw new Error("Ticket not found");
        }

        const updatePayload = { ...ticketData };
        
        // Check for Status Transitions
        const isClosing = (updatePayload.status === 2 && currentTicket.status !== 2);
        const isReopening = (updatePayload.status !== 2 && currentTicket.status === 2);

        // --- LOGIC: CLOSING A TICKET ---
        if (isClosing) {
            updatePayload.closeDate = new Date();
            logger.info(`Ticket ${id} is being closed. Saving cycle to history.`);

            // Determine the Start Date for THIS cycle.
            const cycleStart = currentTicket.lastReopenDate || currentTicket.openDate;

            // Create a snapshot "batch" record in the history
            const closureRecord = this.closureRepository.create({
                ticket: { ticketId: id },
                cycleStartDate: cycleStart,
                cycleCloseDate: updatePayload.closeDate,
                correctiveAction: updatePayload.correctiveAction || currentTicket.correctiveAction,
                materialsUsed: updatePayload.materialsUsed || currentTicket.materialsUsed,
                estimatedLaborHours: updatePayload.estimatedLaborHours || currentTicket.estimatedLaborHours,
                // closedBy: updatePayload.assignedTo ? { id: updatePayload.assignedTo } : null 
            });
            
            await this.closureRepository.save(closureRecord);
        }

        // --- LOGIC: RE-OPENING A TICKET ---
        if (isReopening) {
            logger.info(`Ticket ${id} is being re-opened.`);
            // Mark the start of a new cycle
            updatePayload.lastReopenDate = new Date();
            // We do not clear the old resolution fields, allowing UI to see previous data until overwrite.
        }

        // Perform the Update on the Main Table
        await this.ticketRepository.update(id, updatePayload);
        
        // Fetch the fully updated entity
        const updatedTicket = await this.getTicketById(id);
        
        // Emit Events
        this.sseEmitter.emit('update-ticket', updatedTicket); 
        
        try {
            const makeRs = await emitToMake('ticket.update', { ticket: updatedTicket });
        
            if (makeRs?.status === 'success' || makeRs === 'Accepted') {
                logger.info(`Email sent successfully for ticket.update`);
            } else {
                logger.warn(`Email webhook sent, but Make returned: ${JSON.stringify(makeRs)}`);
            }
        } catch (err) {
            logger.error(`Failed to emit update-ticket webhook: ${err.message}`);
        }
        
        logger.info(`Ticket ${id} updated`);
        return updatedTicket;
    }

    async deleteTicket(id) {
        logger.info(`Archiving ticket ID: ${id}`);
        const ticketToArchive = await this.getTicketById(id);
        if (!ticketToArchive) {
            logger.error(`Ticket ${id} not found for deletion.`);
            throw new Error("Ticket not found");
        }

        const archivedTicket = this.archivedRepository.create(ticketToArchive);
        
        try {
            await this.archivedRepository.save(archivedTicket);
        } catch (error) {
            logger.error(`Error saving to archive: ${error.message}`);
            throw error;
        }

        await this.ticketRepository.delete(id);
        
        // Emit events
        this.sseEmitter.emit('delete-ticket', { id: id }); // For frontend SSE
        
        logger.info(`Ticket ${id} archived and deleted`);
        return { id: id, message: "Ticket archived successfully" };
    }
    async getAllArchivedTickets() {
        logger.info("Fetching all archived tickets");
        return await this.archivedRepository.find({
            relations: this.relations
        });
    }

    async getArchivedTicketById(id) {
        logger.info(`Fetching archived ticket by ID: ${id}`);
        return await this.archivedRepository.findOne({
            where: { ticketId: parseInt(id) },
            relations: this.relations
        });
    }

    // SSE functions
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
            logger.info("SSE client disconnected");
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
        logger.info(`Adding note to ticket ${ticketId} by user ${authorId}`);
        
        const note = this.noteRepository.create({
            text: noteText,
            ticket: { ticketId: parseInt(ticketId) },
            author: { id: parseInt(authorId) },
            createdAt: new Date()
        });

        await this.noteRepository.save(note);
        
        // Retrieve the full note with author info to return to UI
        const savedNote = await this.noteRepository.findOne({
            where: { noteId: note.noteId },
            relations: ["author"]
        });

        return savedNote;
    }
}


module.exports = new TicketService();
