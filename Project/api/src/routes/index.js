const express = require('express');
const router = express.Router();

// Import all routes
const ticketRoutes = require("./ticket.routes");
const divisionRoutes = require("./division.routes");
const drawingRoutes = require("./drawing.routes");
const manufactNonConRoutes = require("./manufact_noncon.routes");
const partRoutes = require("./part.routes");
const sequenceRoutes = require("./sequence.routes");
const statusRoutes = require("./status.routes");
const unitRoutes = require("./unit.routes");
const userRoutes = require("./user.routes");
const woRoutes = require("./wo.routes");


router.use("/tickets", ticketRoutes);
router.use("/divisions", divisionRoutes);
router.use("/drawings", drawingRoutes);
router.use("/manufact-noncons", manufactNonConRoutes);
router.use("/parts", partRoutes);
router.use("/sequences", sequenceRoutes);
router.use("/statuses", statusRoutes);
router.use("/units", unitRoutes);
router.use("/users", userRoutes);
router.use("/work-orders", woRoutes);


module.exports = router;