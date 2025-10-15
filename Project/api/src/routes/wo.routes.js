const express = require("express");
const router = express.Router();
const { WOController } = require ("../controllers/wo.controller");

router.get("/", WOController.getAllWorkOrders);

module.exports = router;