const { Router } = require("express");
const router = Router();
const {
    getAllOpenTickets,
    getAllClosedTickets,
    getTicketById,
    getAllArchivedTickets,
    getArchivedTicketByID,
    createTicket,
    updateTicket,
    deleteTicket,
    connectSSE 
} = require("../controllers/ticket.controller");


// --- Static routes must come BEFORE dynamic routes ---
// This route is for the Server-Sent Events stream
router.get("/events", connectSSE);

// GET /api/tickets/open - Get all active tickets (Status 0 & 1)
router.get("/open", getAllOpenTickets);

// GET /api/tickets/closed - Get all closed tickets (Status 2)
router.get("/closed", getAllClosedTickets);

//GET /api/tickets/archived - Get all archived tickets
router.get("/archived", getAllArchivedTickets);

//GET /api/tickets/archived/:id - Get a single archived ticket by its ID
router.get("/archived/:id", getArchivedTicketByID);

// GET /api/tickets/:id - Get a single ticket by its ID
router.get("/:id", getTicketById);

// POST /api/tickets - Create a new ticket
router.post("/", createTicket);

// PUT /api/tickets/:id - Update an existing ticket
router.put("/:id", updateTicket);

// DELETE /api/tickets/:id - Delete (archive) a ticket
router.delete("/:id", deleteTicket);

module.exports = router;