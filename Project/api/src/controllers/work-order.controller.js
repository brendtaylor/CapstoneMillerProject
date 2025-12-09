/**
 * Controller for Work Order dashboard and filtering logic.
 * 
 * Handles:
 * - Main dashboard -  listing WOs with open ticket counts.
 * - Retrieving specific lists of tickets for a selected Work Order.
 * - Populating context-dependent dropdowns (ex. labor department ) based on the selected Work Order.
 */

const workOrderService = require("../services/work-order.service");
const logger = require("../../logger");

/**
 * Retrieves a summary of Work Orders to populate the main dashboard.
 * 
 * LOGIC:
 * - Does NOT return all Work Orders. Only returns WOs that actually contain tickets matching the status filter.
 * 
 * @route GET /api/work-orders-summary
 * 
 * @param {Object} req - Express request object.
 * @param {string} [req.query.search] - Optional search term to filter by Work Order Number (ex. "123").
 * @param {string} [req.query.status] - Optional comma-separated string of status IDs ("0,1" for Open/In-Progress, "2" for Closed).
 * @returns {Object[]} JSON array of summary objects: [{ wo_id, wo_number, open_ticket_count }, ...]
 */
const getWorkOrderSummary = async (req, res) => {
    try {
        // Capture the optional 'search' query param
        const searchTerm = req.query.search;

        // optional status query parameter ("0,1" or "2")
        const statusString = req.query.status;

        // Pass it to the service
       const data = await workOrderService.getWorkOrderSummary(searchTerm, statusString);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getWorkOrderSummary controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching work order summary" });
    }
};

// Controller for Archived WO Dashboard Summary
const getArchivedWorkOrderSummary = async (req, res) => {
    try {
        const searchTerm = req.query.search;
        // No status filtering for archives
        const data = await workOrderService.getArchivedWorkOrderSummary(searchTerm);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getArchivedWorkOrderSummary controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching archived work order summary" });
    }
};

/**
 * Retrieves the actual ticket(s) details for a specific Work Order.
 * Called when a user expands a Work Order on the dashboard.
 * 
 * @route GET /api/work-orders/:wo_id/tickets
 * 
 * @param {string} req.params.wo_id - The ID of the Work Order.
 * @param {string} [req.query.status] - Optional status filter (defaults to "0,1" in service if omitted).
 * @returns {Object[]} Array of full Ticket objects.
 */
const getTicketsByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;

        // Capture the optional 'status' query param
        const statusString = req.query.status;

        const data = await workOrderService.getTicketsByWorkOrder(woId, statusString);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getTicketsByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching tickets for work order" });
    }
};

/**
 * Retrieves ARCHIVED ticket details for a specific Work Order.
 * 
 * @route GET /api/work-orders/:wo_id/archived-tickets
 * 
 * @param {string} req.params.wo_id - The ID of the Work Order.
 */
const getArchivedTicketsByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;
        const data = await workOrderService.getArchivedTicketsByWorkOrder(woId);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getArchivedTicketsByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching archived tickets for work order" });
    }
};

// ----------------------- Controllers for Filtered Dropdowns -------------------------------------------------
// These endpoints ensure that when a user selects "WO #12345" in the Create Ticket form,
// they only see Units/Sequences/Departments/Nonconformance that are actually associated with that specific WO.

/**
 * @route GET /api/work-orders/:wo_id/units
 */
const getUnitsByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;
        const data = await workOrderService.getUnitsByWorkOrder(woId);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getUnitsByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching units for work order" });
    }
};

/**
 * @route GET /api/work-orders/:wo_id/sequences
 */
const getSequencesByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;
        const data = await workOrderService.getSequencesByWorkOrder(woId);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getSequencesByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching sequences for work order" });
    }
};

/**
 * @route GET /api/work-orders/:wo_id/labor-departments
 */
const getLaborDepartmentsByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;
        const data = await workOrderService.getLaborDepartmentsByWorkOrder(woId);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getLaborDepartmentsByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching departments for work order" });
    }
};

/**
 * @route GET /api/work-orders/:wo_id/nonconformances
 */
const getNonconformancesByWorkOrder = async (req, res) => {
    try {
        const woId = req.params.wo_id;
        const data = await workOrderService.getNonconformancesByWorkOrder(woId);
        res.json(data);
    } catch (error) {
        logger.error(`Error in getNonconformancesByWorkOrder controller: ${error.message}`);
        res.status(500).json({ message: "Error fetching nonconformances for work order" });
    }
};

module.exports = {
    getWorkOrderSummary,
    getArchivedWorkOrderSummary, 
    getTicketsByWorkOrder,
    getArchivedTicketsByWorkOrder, 
    getUnitsByWorkOrder,
    getSequencesByWorkOrder,
    getLaborDepartmentsByWorkOrder,
    getNonconformancesByWorkOrder
};