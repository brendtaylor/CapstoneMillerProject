const express = require("express");
const router = express.Router();
const { DrawingController } = require ("../controllers/drawing.controller");

router.get("/drawings", DrawingController.getAllDrawings);

module.exports = router;