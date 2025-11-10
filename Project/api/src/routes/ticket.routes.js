const express = require("express");
const {
    getAllTickets,
    getTicketByID,
    getAllArchivedTickets,
    getArchivedTicketByID,
    createTicket,
    updateTicket,
    archiveTicket
} = require("../controllers/ticket.controller");

const router = express.Router();

/// GET /api/tickets - Get all tickets
router.get("/", getAllTickets);

// GET /api/tickets/:id - Get a single ticket by its ID
router.get("/:id", getTicketByID);

//GET /api/tickets/archived - Get all archived tickets
router.get("/archived", getAllArchivedTickets);

//GET /api/tickets/archived/:id - Get a single archived ticket by its ID
router.get("/archived/:id", getArchivedTicketByID);

// POST /api/tickets - Create a new ticket
router.post("/", createTicket);

// PUT /api/tickets/:id - Update an existing ticket
router.put("/:id", updateTicket);

// DELETE /api/tickets/:id - Delete (archive) a ticket
router.delete("/:id", archiveTicket);

module.exports = router;