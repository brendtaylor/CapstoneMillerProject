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
            //Get WO number for Quality Ticket ID generation
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) {
                throw new Error(`Work Order with ID ${ticketData.wo} not found.`);
            }
            const woNumber = workOrder.wo;

            //Generate Quality Ticket ID
            const ticketCount = await queryRunner.manager.count("Ticket", {
                where: { wo: ticketData.wo }
            });

            const newTicketNum = (ticketCount + 1).toString().padStart(3, '0');
            const qualityTicketId = `${woNumber}-${newTicketNum}`;
            logger.info(`Generated new Quality Ticket ID: ${qualityTicketId}`);

            //Create Ticket
            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId,
                openDate: new Date(),
                status: 0,
            });
            
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            // Emit Events
            this.sseEmitter.emit('new-ticket', savedTicket); // For frontend SSE
            await emitToMake('new-ticket', savedTicket); // For Make.com webhook
            
            logger.info(`Ticket created with ID: ${savedTicket.ticketId} and Quality ID: ${qualityTicketId}`);
            return savedTicket;

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

        if (updatePayload.status === 1) {                                                   // 1 = 'Closed'
            updatePayload.closeDate = new Date();
            logger.info(`Ticket ${id} is being closed.`);
        }

        await this.ticketRepository.update(id, updatePayload);
        const updatedTicket = await this.getTicketById(id);
        
        // Emit Events
        this.sseEmitter.emit('update-ticket', updatedTicket); // For frontend SSE
        
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
