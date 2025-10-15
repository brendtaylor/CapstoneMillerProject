const express = require("express");
const router = express.Router();
const { PartController } = require ("../controllers/part.controller");

router.get("/", PartController.getAllParts);

module.exports = router;