const express = require("express");
const router = express.Router();
const { DrawingController } = require ("../controllers/drawing.controller");

router.get("/", DrawingController.getAllDrawings);

module.exports = router;