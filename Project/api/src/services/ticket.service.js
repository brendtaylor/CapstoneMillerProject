/**
 * Service layer for Ticket operations. Handles database interactions, custom ID generation via transactions,
 * and real-time broadcasting via Server-Sent Events (SSE).
 */

const { AppDataSource } = require("../data-source");
const { emitToMake } = require("../utils/makeEmitter"); 
const logger = require("../../logger");

class TicketService {
    constructor() {
        // Initialize TypeORM Repositories
        this.ticketRepository = AppDataSource.getRepository("Ticket");
        this.archivedRepository = AppDataSource.getRepository("ArchivedTicket");
        this.workOrderRepository = AppDataSource.getRepository("WorkOrder");
        this.closureRepository = AppDataSource.getRepository("TicketClosure"); 
        this.noteRepository = AppDataSource.getRepository("Note");
        this.auditRepository = AppDataSource.getRepository("AuditLog");
        
        /**
         * @property {Set} clients
         * Holds active HTTP response objects for SSE connections.
         * Used to broadcast updates to all connected frontends.
         */
        this.clients = new Set();

        // Sends a comment line every 30 seconds to keep connections open
        this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), 30000);
        
        logger.info("TicketService initialized");
        
        // Standard relations to fetch with Ticket queries
        this.relations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo", 
            "closures", "closures.closedBy"
        ];

        // Archive relations 
        this.archiveRelations = [
            "status", "initiator", "division", 
            "manNonCon", "laborDepartment", 
            "sequence", "unit", "wo", "assignedTo"
        ];
    }

    // ------------------  SSE HELPER METHODS -------------------------

    /**
     * Sends a 'ping' comment to all connected clients.
     * SSE comments start with a colon (:).
     * keeps the TCP connection alive.
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
     * @param {string} event - The event name ('new-ticket', 'update-ticket', etc.).
     * @param {Object} data - The JSON payload to send.
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

    /**
     * Establishes an SSE connection for a specific client request.
     * Sets headers to disable buffering and caching.
     * @param {Object} req - Express Request
     * @param {Object} res - Express Response
     */
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

    // -------------------- SERVICE METHODS  ----------------------

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

    /**
     * Creates a new ticket.
     * 
     *  CRITICAL LOGIC: Custom ID Generation
     * uses a database transaction to ensure ticket numbers (e.g. 002) 
     * are unique per Work Order. It relies on the helper table `Ticket_Counters`.
     * 1. Start Transaction.
     * 2. Lock/Read the counter for the specific Work Order (WO).
     * 3. Increment the counter.
     * 4. Generate ID (WO_NUMBER + Sequence).
     * 5. Save Ticket.
     * 6. Commit Transaction.
     * 
     * @param {Object} ticketData - The raw body from the controller.
     * @returns {Object} The fully created ticket with relations.
     */
    async createTicket(ticketData) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Validate Work Order exists
            const workOrder = await queryRunner.manager.findOne("WorkOrder", {
                where: { woId: ticketData.wo }
            });
            if (!workOrder) throw new Error(`Work Order ID ${ticketData.wo} not found.`);
            const woNumber = workOrder.wo;

            // 2. Initialize counter for the WO if one doesn't exist 
            await queryRunner.query(`
                IF NOT EXISTS (SELECT 1 FROM Ticket_Counters WHERE WO_ID = @0)
                INSERT INTO Ticket_Counters (WO_ID, LAST_TICKET_NUM) VALUES (@0, 0)
            `, [ticketData.wo]);
            
            // 3. Atomically increment the counter 
            const counterResult = await queryRunner.query(`
                UPDATE Ticket_Counters
                SET LAST_TICKET_NUM = LAST_TICKET_NUM + 1
                OUTPUT INSERTED.LAST_TICKET_NUM
                WHERE WO_ID = @0
            `, [ticketData.wo]);

            const nextSeqNum = counterResult[0].LAST_TICKET_NUM;
            //Format: 25412-001
            const qualityTicketId = `${woNumber}-${nextSeqNum.toString().padStart(3, '0')}`;
            
            // 4. Create Ticket Entity
            const newTicket = queryRunner.manager.create("Ticket", {
                ...ticketData,
                qualityTicketId: qualityTicketId,
                openDate: new Date(),
                status: 0, 
            });
            
            const savedTicket = await queryRunner.manager.save("Ticket", newTicket);
            await queryRunner.commitTransaction();

            // Fetch complete ticket object for front-end
            const completeTicket = await this.getTicketById(savedTicket.ticketId);
            
            // Notify Make.com webhook and broadcast updates
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

    /**
     * Updates general ticket information.
     * 
     * NOTE: Extracts sensitive fields (status, assignedTo) to prevent accidental overwrites. 
     * Use specific methods for status updates and ticket assigning.
     * 
     * @param {string} id - The ID of the ticket to update.
     * @param {Object} ticketData - The raw request body containing fields to update.
     * @returns {Object} The updated ticket entity with all relations.
     */
    async updateTicket(id, ticketData) {
        const { status, assignedTo, ...allowedUpdates } = ticketData;

        await this.ticketRepository.update(id, allowedUpdates);
        
        const updatedTicket = await this.getTicketById(id);
    
        this.broadcast('update-ticket', updatedTicket); 
        this.triggerWebhook('ticket.update', updatedTicket);
        
        return updatedTicket;
    }

    /**
     * Handles state transitions (Open -> In Progress -> Closed).
     *      - If transitioning to Closed (2): Create a `TicketClosure` record.
     *      - If transitioning FROM Closed: Update `lastReopenDate`.
     * @param {string} id - Ticket ID
     * @param {number} newStatus - Target status ID
     * @param {Object} extraData - Fields required for closing (correctiveAction, materials, laborHours)
     * @param {Object} user - The user performing the action (for audit/closure tracking).
     */
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

        // Re-opening Logic: Track dates for calculating cycle times later
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
        this.triggerWebhook('ticket.status', updatedTicket);

        return updatedTicket;
    }

    /**
     * Assigns a specific user to a ticket.
     *  - Updates the `assignedTo` field in the database.
     *  - Logs the assignment action in the Audit Log, recording who performed the action (`actingUser`).
     *  - Broadcasts the update via SSE so all dashboards reflect the new assignment immediately.
     *  - Triggers an Make.com webhook to send an email notificaiton to the assigned user
     * 
     * @param {string} id - The ID of the ticket.
     * @param {string} targetUserId - The ID of the user being assigned.
     * @param {Object} actingUser - The user performing the assignment.
     * @returns {Object} The updated ticket entity.
     */
    async assignTicketUser(id, targetUserId, actingUser) {
        await this.ticketRepository.update(id, { assignedTo: targetUserId });
        await this.logAudit(actingUser, id, null, `Assigned User ${targetUserId} to Ticket`);

        const updatedTicket = await this.getTicketById(id);
        
        this.broadcast('update-ticket', updatedTicket);
        this.triggerWebhook('ticket.assign', updatedTicket);

        return updatedTicket;
    }

    /**
     * Archives a ticket.
     *  -Fetches the ticket to ensure it exists.
     *  - Copies the ticket data to the `ArchivedTicket` table.
     *  - Deletes the ticket from the main `Ticket` table.
     *  - Broadcasts a 'delete-ticket' event so all connected clients remove it from their dashboards immediately.
     * 
     * @param {string} id - The ID of the ticket to delete.
     * @returns {Object} A confirmation object: { id: string, message: string }
     * @throws {Error} If the ticket does not exist.
     */
    async deleteTicket(id) {
        const ticketToArchive = await this.getTicketById(id);
        if (!ticketToArchive) throw new Error("Ticket not found");

        const archivedTicket = this.archivedRepository.create(ticketToArchive);
        await this.archivedRepository.save(archivedTicket);
        await this.ticketRepository.delete(id);
        
        this.broadcast('delete-ticket', { id: parseInt(id, 10) }); 
        return { id: id, message: "Ticket archived successfully" };
    }

    /**
     * Helper to insert records into the Audit Log table.
     */
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

    /**
     * Helper to send data to external Make.Com webhook
     */
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
