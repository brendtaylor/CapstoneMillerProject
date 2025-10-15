const express = require("express");
const router = express.Router();
const { SequenceController } = require ("../controllers/sequence.controller");

router.get("/", SequenceController.getAllSequences);

module.exports = router;