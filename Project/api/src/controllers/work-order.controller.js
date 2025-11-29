const workOrderService = require("../services/work-order.service");
const logger = require("../../logger");

// Controller for the new WO Dashboard Summary
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

// Controller to get all tickets for one WO
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

// --- Controllers for Filtered Dropdowns ---

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
    getTicketsByWorkOrder,
    getUnitsByWorkOrder,
    getSequencesByWorkOrder,
    getLaborDepartmentsByWorkOrder,
    getNonconformancesByWorkOrder
};