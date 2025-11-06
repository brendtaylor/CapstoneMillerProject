const express = require('express');
const router = express.Router();
const { createGenericController } = require('../controllers/generic.controller');


// Specialized route for tickets since they are more complicated than a single GET function.
const ticketRoutes = require("./ticket.routes");
router.use("/tickets", ticketRoutes);


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

const drawingController = createGenericController(DrawingNum, 'drawing_num');
router.get('/drawings', drawingController.getAll);

const partController = createGenericController(PartNum, 'partNum');
router.get('/parts', partController.getAll);

const woController = createGenericController(WorkOrder, 'wo');
router.get('/work-orders', woController.getAll);

const unitController = createGenericController(Unit, 'unitName');
router.get('/units', unitController.getAll);

const sequenceController = createGenericController(Sequence, 'seqName');
router.get('/sequences', sequenceController.getAll);

const nonConController = createGenericController(ManNonCon, 'nonCon');
router.get('/manufact-noncons', nonConController.getAll);

const statusController = createGenericController(Status, 'statusDescription');
router.get('/statuses', statusController.getAll);


module.exports = router;