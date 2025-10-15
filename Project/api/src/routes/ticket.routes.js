const express = require("express");
const {
    getAllTickets,
    getTicketByID,
    createTicket,
    updateTicket,
    archiveTicket
} = require("../controllers/ticket.controller");

const router = express.Router();

/// GET /api/tickets - Get all tickets
router.get("/", getAllTickets);

// GET /api/tickets/:id - Get a single ticket by its ID
router.get("/:id", getTicketByID);

// POST /api/tickets - Create a new ticket
router.post("/", createTicket);

// PUT /api/tickets/:id - Update an existing ticket
router.put("/:id", updateTicket);

// DELETE /api/tickets/:id - Delete (archive) a ticket
router.delete("/:id", archiveTicket);

module.exports = router;