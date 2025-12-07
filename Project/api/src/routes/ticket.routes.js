// Project/api/src/routes/ticket.routes.js (Updated)
const { Router } = require("express");
const router = Router();
const {
    getAllTickets,
    getTicketById,
    getAllArchivedTickets,
    getArchivedTicketByID,
    createTicket,
    updateTicket,
    deleteTicket,
    connectSSE,
    getTicketNotes,
    addTicketNote,
    // --- NEW CONTROLLERS IMPORTED ---
    updateTicketStatus,
    assignTicketSelf,
    assignTicketUser
} = require("../controllers/ticket.controller");
const authorize = require("../middleware/authorize");
const { authenticateToken } = require("../middleware/auth.middleware"); // <-- Added Import

// --- Static routes must come BEFORE dynamic routes ---
// This route is for the Server-Sent Events stream
router.get("/events", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), connectSSE);

// GET /api/tickets/open - Get all tickets (Viewer, Editor, Admin)
router.get("/", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), getAllTickets);

// POST /api/tickets - Create a new ticket (Viewer, Editor, Admin)
router.post("/", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), createTicket);

// GET /api/tickets/archived - Get all archived tickets (Admin only)
router.get("/archived", authenticateToken, authorize(['Admin']), getAllArchivedTickets);

// GET /api/tickets/archived/:id - Get a single archived ticket by its ID (Admin only)
router.get("/archived/:id", authenticateToken, authorize(['Admin']), getArchivedTicketByID);

// GET /api/tickets/:id - Get a single ticket by its ID (Viewer, Editor, Admin)
router.get("/:id", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), getTicketById);

// PUT /api/tickets/:id - General update to non-sensitive fields
// We will restrict this to fields Viewers ARE allowed to edit.
router.put("/:id", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), updateTicket);

// --- NEW GRANULAR ROUTES FOR SENSITIVE ACTIONS ---

// PATCH /api/tickets/:id/status - Change status of ticket (Editor, Admin)
router.patch("/:id/status", authenticateToken, authorize(['Editor', 'Admin']), updateTicketStatus);

// PATCH /api/tickets/:id/assign/self - Assign themselves to a ticket (Editor, Admin)
router.patch("/:id/assign/self", authenticateToken, authorize(['Editor', 'Admin']), assignTicketSelf);

// PATCH /api/tickets/:id/assign/:userId - Assign anyone to a ticket (Admin only)
router.patch("/:id/assign/:userId", authenticateToken, authorize(['Admin']), assignTicketUser);

// DELETE /api/tickets/:id - Delete (archive) a ticket (Admin only)
router.delete("/:id", authenticateToken, authorize(['Admin']), deleteTicket);

// GET /api/tickets/:id/notes - Get Notes for a ticket (Viewer, Editor, Admin)
router.get("/:id/notes", authenticateToken, authorize(['Viewer', 'Editor', 'Admin']), getTicketNotes);

// POST /api/ticket/:id/notes - Add notes to a ticket (Editor, Admin)
// NOTE: Fixed authorization syntax
router.post("/:id/notes", authenticateToken, authorize(['Admin', 'Editor']), addTicketNote);

module.exports = router;