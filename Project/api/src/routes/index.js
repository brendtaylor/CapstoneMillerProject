const express = require('express');
const router = express.Router();
const { createGenericController } = require('../controllers/generic.controller');


// Specialized route for tickets since they are more complicated than a single GET function.
const ticketRoutes = require("./ticket.routes");
const workOrderRoutes = require("./work-order.routes");
router.use("/tickets", ticketRoutes);
router.use("/", workOrderRoutes);

// --- Import the ENTITIES for the simple tables ---
const Division = require('../entities/division.entity');
const User = require('../entities/user.entity');
const DrawingNum = require('../entities/drawing.entity');
const PartNum = require('../entities/part.entity');
const WorkOrder = require('../entities/wo.entity');
const Unit = require('../entities/unit.entity');
const Sequence = require('../entities/sequence.entity');
const ManNonCon = require('../entities/manufact_noncon.entity');
const Status = require('../entities/status.entity');


// --- Creating all SIMPLE endpoints dynamically ---
const divisionController = createGenericController(Division, 'divisionName');
router.get('/divisions', divisionController.getAll);

const userController = createGenericController(User, 'name');
router.get('/users', userController.getAll);

const statusController = createGenericController(Status, 'statusDescription');
router.get('/statuses', statusController.getAll);

const ldController = createGenericController(LaborDepartment, 'departmentName'); // Added
router.get('/labor-departments', ldController.getAll); // Added


module.exports = router;