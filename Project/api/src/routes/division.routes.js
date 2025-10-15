const express = require("express");
const router = express.Router();
const { DivisionController } = require ("../controllers/division.controller");

router.get("/divisions", DivisionController.getAllDivisions);

module.exports = router;