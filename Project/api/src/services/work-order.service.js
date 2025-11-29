const { AppDataSource } = require("../data-source");
const logger = require("../../logger");

// Repositories for all our new entities
const workOrderRepository = AppDataSource.getRepository("WorkOrder");
const ticketRepository = AppDataSource.getRepository("Ticket");
const unitLinkRepository = AppDataSource.getRepository("WorkOrderUnit");
const sequenceLinkRepository = AppDataSource.getRepository("WorkOrderSequence");
const departmentLinkRepository = AppDataSource.getRepository("WorkOrderLaborDepartment");
const nonconformanceLinkRepository = AppDataSource.getRepository("WorkOrderNonconformance");

class WorkOrderService {

    /**
     * Gets the list of Work Orders that have at least one active ticket.
     * Accepts an optional searchTerm to filter by WO Number.
     */
    async getWorkOrderSummary(searchTerm = null) {
        logger.info(`Fetching work order summary. Search: ${searchTerm || 'None'}`);
        try {
            const query = workOrderRepository.createQueryBuilder("wo")
                // 1. Inner Join to get only WOs with active tickets
                .innerJoin("Ticket", "t", "t.wo = wo.woId") 
                // 2. Filter for Open/In-Progress tickets
                .where("t.status IN (:...statuses)", { statuses: [0, 1] });

            // 3. Apply Search Filter if provided
            if (searchTerm) {
                query.andWhere("wo.wo LIKE :search", { search: `%${searchTerm}%` });
            }

            const summary = await query
                .select("wo.woId", "wo_id") 
                .addSelect("wo.wo", "wo_number") 
                .addSelect("COUNT(t.ticketId)", "open_ticket_count") 
                .groupBy("wo.woId, wo.wo")
                .orderBy("wo.wo", "ASC")
                .getRawMany(); 

            return summary;
        } catch (error) {
            logger.error(`Error in getWorkOrderSummary: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gets tickets for a single, specific Work Order ID.
     * UPDATED: Accepts an optional statusFilter (0, 1, or 2).
     */
    async getTicketsByWorkOrder(woId, statusFilter = null) {
        logger.info(`Fetching tickets for WO ID: ${woId} with status: ${statusFilter ?? 'ALL'}`);
        
        // 1. Initialize the WHERE clause with the Work Order ID
        const whereClause = {
            wo: { woId: parseInt(woId) }
        };

        // 2. If a status filter is provided, add it to the WHERE clause
        // Checks for null/undefined so that status "0" (Open) is still valid
        if (statusFilter !== null && statusFilter !== undefined) {
            whereClause.status = { statusId: parseInt(statusFilter) };
        }

        return await ticketRepository.find({
            where: whereClause,
            relations: [
                "status",
                "initiator",
                "division",
                "manNonCon",
                "laborDepartment",
                "sequence",
                "unit",
                "wo",
                "assignedTo"
            ],
            order: {
                openDate: "DESC" // Show newest first
            }
        });
    }

    /**
     * Gets the *filtered* list of Units valid for a specific WO.
     */
    async getUnitsByWorkOrder(woId) {
        logger.info(`Fetching valid units for WO ID: ${woId}`);
        const results = await unitLinkRepository.find({
            where: { woId: woId },
            relations: ["unit"]
        });
        // Return only the unit objects themselves for the dropdown
        return results.map(r => r.unit);
    }

    /**
     * Gets the *filtered* list of Sequences valid for a specific WO.
     */
    async getSequencesByWorkOrder(woId) {
        logger.info(`Fetching valid sequences for WO ID: ${woId}`);
        const results = await sequenceLinkRepository.find({
            where: { woId: woId },
            relations: ["sequence"]
        });
        return results.map(r => r.sequence);
    }

    /**
     * Gets the *filtered* list of Labor Departments valid for a specific WO.
     */
    async getLaborDepartmentsByWorkOrder(woId) {
        logger.info(`Fetching valid departments for WO ID: ${woId}`);
        const results = await departmentLinkRepository.find({
            where: { woId: woId },
            relations: ["laborDepartment"]
        });
        return results.map(r => r.laborDepartment);
    }

    /**
     * Gets the *filtered* list of Nonconformances valid for a specific WO.
     */
    async getNonconformancesByWorkOrder(woId) {
        logger.info(`Fetching valid nonconformances for WO ID: ${woId}`);
        const results = await nonconformanceLinkRepository.find({
            where: { woId: woId },
            relations: ["nonconformance"]
        });
        return results.map(r => r.nonconformance);
    }
}

module.exports = new WorkOrderService();