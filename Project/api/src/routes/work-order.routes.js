const { Router } = require("express");
const {
    getWorkOrderSummary,
    getTicketsByWorkOrder,
    getUnitsByWorkOrder,
    getSequencesByWorkOrder,
    getLaborDepartmentsByWorkOrder,
    getNonconformancesByWorkOrder
} = require("../controllers/work-order.controller");

const router = Router();

// Route for the new dashboard
router.get("/work-orders-summary", getWorkOrderSummary);

// Route to get all tickets for a single WO
router.get("/work-orders/:wo_id/tickets", getTicketsByWorkOrder);

// Routes for the filtered dropdowns
router.get("/work-orders/:wo_id/units", getUnitsByWorkOrder);
router.get("/work-orders/:wo_id/sequences", getSequencesByWorkOrder);
router.get("/work-orders/:wo_id/labor-departments", getLaborDepartmentsByWorkOrder);
router.get("/work-orders/:wo_id/nonconformances", getNonconformancesByWorkOrder);

module.exports = router;