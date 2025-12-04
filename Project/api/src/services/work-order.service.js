const { AppDataSource } = require("../data-source");
const { In } = require("typeorm"); 
const logger = require("../../logger");

// Repositories for all our new entities
const workOrderRepository = AppDataSource.getRepository("WorkOrder");
const ticketRepository = AppDataSource.getRepository("Ticket");
const unitLinkRepository = AppDataSource.getRepository("WorkOrderUnit");
const sequenceLinkRepository = AppDataSource.getRepository("WorkOrderSequence");
const departmentLinkRepository = AppDataSource.getRepository("WorkOrderLaborDepartment");
const nonconformanceLinkRepository = AppDataSource.getRepository("WorkOrderNonconformance");
const archivedTicketRepository = AppDataSource.getRepository("ArchivedTicket");

class WorkOrderService {

    /**
     * Gets the list of Work Orders, filtering by Search Term and Status.
     * statusString: "0,1" (Active) or "2" (Closed). Defaults to Active (0,1).
     */
    async getWorkOrderSummary(searchTerm = null, statusString = null) {
        // Default to [0, 1] (Open & In-Progress) if no status is provided
        const statuses = statusString 
            ? statusString.split(',').map(Number) 
            : [0, 1];

        logger.info(`Fetching work order summary. Search: ${searchTerm || 'None'}, Statuses: ${statuses}`);

        try {
            const query = workOrderRepository.createQueryBuilder("wo")
                // Inner Join to get only WOs that have tickets matching the provided status
                .innerJoin("Ticket", "t", "t.wo = wo.woId") 
                // Filter tickets by the requested statuses
                .where("t.status IN (:...statuses)", { statuses });

            // Apply Search Filter if provided
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
     * Gets the summary of Work Orders that contain ARCHIVED tickets.
     */
    async getArchivedWorkOrderSummary(searchTerm = null) {
        logger.info(`Fetching archived work order summary. Search: ${searchTerm || 'None'}`);

        try {
            // query 'WorkOrder' aliased as 'wo'
            const query = workOrderRepository.createQueryBuilder("wo")
                // Inner join with ArchivedTicket ('at') to only get WOs with archives
                .innerJoin("ArchivedTicket", "at", "at.wo = wo.woId");

            // Apply Search Filter if provided
            if (searchTerm) {
                query.andWhere("wo.wo LIKE :search", { search: `%${searchTerm}%` });
            }

            const summary = await query
                .select("wo.woId", "wo_id") 
                .addSelect("wo.wo", "wo_number") 
                // Count the archived tickets
                .addSelect("COUNT(at.ticketId)", "open_ticket_count") 
                .groupBy("wo.woId, wo.wo")
                .orderBy("wo.wo", "ASC")
                .getRawMany(); 

            return summary;
        } catch (error) {
            logger.error(`Error in getArchivedWorkOrderSummary: ${error.message}`);
            throw error;
        }
    }

    /**
     * Gets tickets for a specific Work Order, filtered by status.
     */
    async getTicketsByWorkOrder(woId, statusString = null) {
        // Default to [0, 1] (Open & In-Progress) if no status is provided
        const statuses = statusString 
            ? statusString.split(',').map(Number) 
            : [0, 1];

        logger.info(`Fetching tickets for WO ID: ${woId}, Statuses: ${statuses}`);

        return await ticketRepository.find({
            where: { 
                wo: { woId: parseInt(woId) },
                status: { statusId: In(statuses) } 
            },
            relations: [
                "status", 
                "initiator", 
                "division", 
                "manNonCon",
                "laborDepartment", 
                "sequence", 
                "unit", 
                "wo", 
                "assignedTo", 
                "files",
                "closures",           
                "closures.closedBy"   
            ],
            order: {
                openDate: "DESC" 
            }
        });
    }

    /**
     * Gets the filtered list of Units valid for a specific WO.
     */
    async getUnitsByWorkOrder(woId) {
        logger.info(`Fetching valid units for WO ID: ${woId}`);
        const results = await unitLinkRepository.find({
            where: { woId: woId },
            relations: ["unit"]
        });
        return results.map(r => r.unit);
    }

    /**
     * Gets ARCHIVED tickets for a specific Work Order.
     */
    async getArchivedTicketsByWorkOrder(woId) {
        logger.info(`Fetching archived tickets for WO ID: ${woId}`);

        return await archivedTicketRepository.find({
            where: { 
                wo: { woId: parseInt(woId) }
            },
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
                openDate: "DESC" 
            }
        });
    }

    /**
     * Gets the filtered list of Sequences valid for a specific WO.
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
     * Gets the filtered list of Labor Departments valid for a specific WO.
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
     * Gets the filtered list of Nonconformances valid for a specific WO.
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