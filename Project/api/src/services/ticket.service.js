const { AppDataSource } = require("../data-source");
const { emitToMake } = require("../utils/makeEmitter"); 
const { EventEmitter } = require("events"); // Node's built-in EventEmitter
const logger = require("../../logger");

class TicketService {
    constructor() {
        this.ticketRepository = AppDataSource.getRepository("Ticket");
        this.archivedRepository = AppDataSource.getRepository("ArchivedTicket");
        this.workOrderRepository = AppDataSource.getRepository("WorkOrder"); 
        this.sseEmitter = new EventEmitter(); 
        logger.info("TicketService initialized");
    
        // Define standard relations
        this.relations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo", "files"
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
            
            // 1. Save the raw ticket
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            // 2. FETCH COMPLETE TICKET 
            // fetch the full entity with relations so the UI receives { wo: { woId: ... } }
            const completeTicket = await this.getTicketById(savedTicket.ticketId);

            // 3. Emit Events using the COMPLETE ticket
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
            await queryRunner.rollbackTransaction();
            logger.error(`Error in createTicket transaction: ${error.message}`);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateTicket(id, ticketData) {
        logger.info(`Updating ticket ID: ${id}`);
        const updatePayload = { ...ticketData };

        if (updatePayload.status === 2) {                                                   // 2 = 'Closed'
            updatePayload.closeDate = new Date();
            logger.info(`Ticket ${id} is being closed.`);
        }

        await this.ticketRepository.update(id, updatePayload);
        const updatedTicket = await this.getTicketById(id);
        
        // Emit Events
        this.sseEmitter.emit('update-ticket', updatedTicket); // For frontend SSE
        
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
}


module.exports = new TicketService();
