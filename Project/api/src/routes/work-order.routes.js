const { Router } = require("express");
const {
    getWorkOrderSummary,
    getArchivedWorkOrderSummary, 
    getTicketsByWorkOrder,
    getArchivedTicketsByWorkOrder, 
    getUnitsByWorkOrder,
    getSequencesByWorkOrder,
    getLaborDepartmentsByWorkOrder,
    getNonconformancesByWorkOrder
} = require("../controllers/work-order.controller");
const authorize = require("../middleware/authorize");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = Router();

// Route for the WO dashboard
router.get("/work-orders-summary", getWorkOrderSummary);

// Route for the Archive dashboard
router.get("/work-orders/archived-summary", authenticateToken, authorize(['Admin']), getArchivedWorkOrderSummary);

// Route to get all tickets for a single WO
router.get("/work-orders/:wo_id/tickets", getTicketsByWorkOrder);

// Route to get all ARCHIVED tickets for a single WO
router.get("/work-orders/:wo_id/archived-tickets", getArchivedTicketsByWorkOrder);

// Routes for the filtered dropdowns
router.get("/work-orders/:wo_id/units", getUnitsByWorkOrder);
router.get("/work-orders/:wo_id/sequences", getSequencesByWorkOrder);
router.get("/work-orders/:wo_id/labor-departments", getLaborDepartmentsByWorkOrder);
router.get("/work-orders/:wo_id/nonconformances", getNonconformancesByWorkOrder);

module.exports = router;