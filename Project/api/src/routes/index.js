const express = require('express');
const router = express.Router();
const { createGenericController } = require('../controllers/generic.controller');

// --- Specialized Routes ---
const ticketRoutes = require("./ticket.routes");
router.use("/tickets", ticketRoutes);
const workOrderRoutes = require("./work-order.routes");
router.use("/", workOrderRoutes); 

// --- Import the ENTITIES for the SIMPLE tables ---
const Division = require('../entities/division.entity');
const User = require('../entities/user.entity');
const Status = require('../entities/status.entity');
const LaborDepartment = require('../entities/labor-department.entity'); // Added
const WorkOrder = require('../entities/wo.entity'); // Added back

// --- Creating all SIMPLE endpoints dynamically ---
const divisionController = createGenericController(Division, 'divisionName');
router.get('/divisions', divisionController.getAll);

const userController = createGenericController(User, 'name');
router.get('/users', userController.getAll);

const statusController = createGenericController(Status, 'statusDescription');
router.get('/statuses', statusController.getAll);

const ldController = createGenericController(LaborDepartment, 'departmentName'); 
router.get('/labor-departments', ldController.getAll);

const woController = createGenericController(WorkOrder, 'wo'); // Added back
router.get('/work-orders', woController.getAll); // Added back


module.exports = router;