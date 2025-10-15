const express = require('express');
const router = express.Router();

// Import all your individual routers
const ticketRoutes = require("./ticket.routes");
const divisionRoutes = require("./division.routes");
const drawingRoutes = require("./drawing.routes");
const nonconRoutes = require("./manufact_noncon.routes");
const partRoutes = require("./part.routes");
const sequenceRoutes = require("./sequence.routes");
const statusRoutes = require("./status.routes");
const userRoutes = require("./user.routes");
const woRoutes = require("./wo.routes");

router.use(ticketRoutes);
router.use(divisionRoutes);
router.use(drawingRoutes);
router.use(nonconRoutes);
router.use(partRoutes);
router.use(sequenceRoutes);
router.use(statusRoutes);
router.use(userRoutes);
router.use(woRoutes);

module.exports = router;