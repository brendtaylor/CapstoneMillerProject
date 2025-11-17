const { AppDataSource } = require("../data-source");
const { makeEmitter } = require("../utils/makeEmitter");
const logger = require("../../logger");

class TicketService {
    constructor() {
        this.ticketRepository = AppDataSource.getRepository("Ticket");
        this.archivedRepository = AppDataSource.getRepository("ArchivedTicket");
        // Add WorkOrder repository to get WO number for the new ID
        this.workOrderRepository = AppDataSource.getRepository("WorkOrder"); 
        this.sseEmitter = makeEmitter();
        logger.info("TicketService initialized");
    }

    async getAllTickets() {
        logger.info("Fetching all tickets");
        return await this.ticketRepository.find({
            relations: [
                "status", "initiator", "division", 
                "manNonCon", "laborDepartment", // Updated relations
                "sequence", "unit", "wo", "assignedTo" // Updated relations
            ]
        });
    }

    async getTicketById(id) {
        logger.info(`Fetching ticket by ID: ${id}`);
        const ticket = await this.ticketRepository.findOne({ 
            where: { ticketId: id },
            relations: [
                "status", "initiator", "division", 
                "manNonCon", "laborDepartment", // Updated relations
                "sequence", "unit", "wo", "assignedTo" // Updated relations
            ]
        });
        if (!ticket) {
            logger.warn(`Ticket ID ${id} not found`);
        }
        return ticket;
    }

    /**
     * Creates a new ticket and generates the custom QUALITY_TICKET_ID.
     * This function uses a transaction to ensure atomic operations.
     */
    async createTicket(ticketData) {
        logger.info("Creating new ticket with transaction");

        // Use a transaction to safely generate the new ID
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Step 1: Get the Work Order string (e.g., "24113") from the WO ID
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) {
                throw new Error(`Work Order with ID ${ticketData.wo} not found.`);
            }
            const woNumber = workOrder.wo; // This is the string "24113"

            // Step 2: Count existing tickets for this Work Order
            const ticketCount = await queryRunner.manager.count("Ticket", {
                where: { wo: ticketData.wo }
            });

            // Step 3: Format the new QUALITY_TICKET_ID
            const newTicketNum = (ticketCount + 1).toString().padStart(3, '0'); // e.g., "001", "012"
            const qualityTicketId = `${woNumber}-${newTicketNum}`; // e.g., "24113-001"
            logger.info(`Generated new Quality Ticket ID: ${qualityTicketId}`);

            // Step 4: Create and save the new ticket
            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId, // Set the new generated ID
                openDate: new Date(),
                status: 0, // Default to 'Open'
            });
            
            const savedTicket = await queryRunner.manager.save(newTicket);

            // Step 5: Commit the transaction
            await queryRunner.commitTransaction();

            // Step 6: Emit SSE event and return
            this.sseEmitter.emit('new-ticket', savedTicket);
            logger.info(`Ticket created with ID: ${savedTicket.ticketId} and Quality ID: ${qualityTicketId}`);
            
            return savedTicket;

        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            logger.error(`Error in createTicket transaction: ${error.message}`);
            throw error; // Re-throw error to be handled by controller
        } finally {
            // Always release the query runner
            await queryRunner.release();
        }
    }

    /**
     * Updates a ticket.
     * This now handles setting 'assignedTo' and the "closing" fields.
     */
    async updateTicket(id, ticketData) {
        logger.info(`Updating ticket ID: ${id}`);
        
        // This is the data payload from the frontend
        const updatePayload = { ...ticketData };

        // --- Handle new "Closing" logic ---
        // If status is being set to 1 ('Closed'), set the closeDate
        if (updatePayload.status === 1) {
            updatePayload.closeDate = new Date();
            logger.info(`Ticket ${id} is being closed.`);
            // The 'estimatedLaborHours', 'correctiveAction', and 'materialsUsed'
            // fields are expected to be in ticketData from the "closing" overlay.
        }

        // --- Handle new "Assigned To" logic ---
        // If status is being set to "In Progress" (let's assume ID 2, or check if it's not 0 or 1)
        // This is just an example; you'll need to define the status ID for "In Progress"
        // if (updatePayload.status === 2 && updatePayload.assignedTo) {
        //     logger.info(`Ticket ${id} assigned to user: ${updatePayload.assignedTo}`);
        // }

        await this.ticketRepository.update(id, updatePayload);
        
        const updatedTicket = await this.getTicketById(id);
        
        // SSE event
        this.sseEmitter.emit('update-ticket', updatedTicket);
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

        // Move to archive
        const archivedTicket = this.archivedRepository.create(ticketToArchive);
        
        // Need to handle potential foreign key relation issues if entities are complex
        // For simple data, this is fine.
        try {
            await this.archivedRepository.save(archivedTicket);
        } catch (error) {
            logger.error(`Error saving to archive: ${error.message}`);
            throw error;
        }

        // Delete from main table
        await this.ticketRepository.delete(id);
        
        // SSE event
        this.sseEmitter.emit('delete-ticket', { id: id });
        logger.info(`Ticket ${id} archived and deleted`);
        
        return { id: id, message: "Ticket archived successfully" };
    }

    // Function to handle Server-Sent Events (SSE)
    async connectSSE(req, res) {
        logger.info("SSE client connected");
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders(); // flush the headers to establish the connection

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