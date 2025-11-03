const express = require("express");
const router = express.Router();
const { NonconController } = require ("../controllers/manufact_noncon.controller");

router.get("/", NonconController.getAllNoncons);

module.exports = router;