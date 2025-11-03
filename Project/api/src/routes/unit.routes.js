const express = require("express");
const router = express.Router();
const { UnitController } = require("../controllers/unit.controller");


router.get("/", UnitController.getAllUnits);

module.exports = router;