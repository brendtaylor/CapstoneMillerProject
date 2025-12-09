/**
 * Controller layer for handling HTTP requests related to Quality Tickets.
 * This file delegates business logic to the TicketService and handles HTTP responses,
 * status codes, and basic input validation.
 */

const ticketService = require("../services/ticket.service.js");


/**
 * Retrieves a list of all tickets in the database
 * 
 * NOTE: This endpoint retrieves *all* tickets without pagination. 
 * this is not used by the frontend (which filters by Work Order),
 * but was left as a potential tool for debugging or reviews.
 * 
 * @route GET /api/tickets
 */
async function getAllTickets(req, res) {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error); 
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Creates a new ticket based on the provided request body.
 * @route POST /api/tickets
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Ticket data (division, wo, description, etc.).
 * @param {Object} res - Express response object.
 * @returns {Object} 201 - The created ticket object.
 * @returns {Object} 400 - If validation fails (ex: missing required fields).
 */
async function createTicket(req, res) {
    try {
        const newTicket = await ticketService.createTicket(req.body);
        res.status(201).json(newTicket);
    } catch (error) {
        console.error("Error creating ticket:", error);
        
        if (error.message.startsWith("Validation Error:")) {
            const friendlyErrorMessage = error.message.replace("Validation Error: ", "");
            return res.status(400).json({ message: friendlyErrorMessage });
        }
        
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Retrieves a specific ticket by its ticketId.
 * @route GET /api/tickets/:id
 * 
 * @param {Object} req - Express request object.
 * @param {string} req.params.id - The primary key ID of the ticket.
 */
async function getTicketById(req, res) { 
    try {
        const ticket = await ticketService.getTicketById(req.params.id);
        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error getting ticket by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Updates general fields of a ticket (descriptions, nonconformance, sequence, etc. )
 * Does not handle status changes or assignment
 * @route PUT /api/tickets/:id
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Fields to update
 */
async function updateTicket(req, res) {
    try {
        const updatedTicket = await ticketService.updateTicket(req.params.id, req.body);
        if (updatedTicket) {
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error updating ticket:", error);

        if (error.message.startsWith("Validation Error:")) {
            const friendlyErrorMessage = error.message.replace("Validation Error: ", "");
            return res.status(400).json({ message: friendlyErrorMessage });
        }

        if (error.message === "Ticket not found") {
            return res.status(404).json({ message: "Ticket not found" });
        }
       
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Updates the status of a ticket (Open -> In Progress -> Closed)
 *      -If closing (status=2), requires the closing fields (correctiveAction, materialsUsed, estimatedLabor).
 *      -Status is extracted from the body and the other fields are passed as 'extraData'
 * @route PATCH /api/tickets/:id/status
 * 
 * @param {number} req.body.status - The new status ID (0, 1, or 2)
 */
async function updateTicketStatus(req, res) {
    try {
        const { status, ...extraData } = req.body;
        
        if (status === undefined) {
            return res.status(400).json({ message: "Status is required." });
        }
        
        const updatedTicket = await ticketService.updateTicketStatus(req.params.id, status, extraData, req.user); 
        
        if (updatedTicket) {
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Assigns the ticket to the currently authenticated user.
 * 
 * @route PATCH /api/tickets/:id/assign/self
 */
async function assignTicketSelf(req, res) {
    try {
        const userId = req.user.id; 
        
        const updatedTicket = await ticketService.assignTicketUser(req.params.id, userId, req.user);
        
        if (updatedTicket) {
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error assigning ticket to self:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


/**
 * Assigns the ticket to a specific user provided in the route parameters.
 * @route PATCH /api/tickets/:id/assign/:userId
 * 
 * @param {string} req.params.userId - The ID of the user to assign.
 */
async function assignTicketUser(req, res) {
    try {
        const { userId } = req.params; 
        
        const updatedTicket = await ticketService.assignTicketUser(req.params.id, userId, req.user);
        
        if (updatedTicket) {
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error assigning ticket to user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Archives a ticket.
 * 
 * @route DELETE /api/tickets/:id.
 */
async function deleteTicket(req, res) { 
    try {
        const result = await ticketService.deleteTicket(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error archiving ticket:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


/**
 * Establishes a Server-Sent Events (SSE) connection with the client.
 * Used for real-time updates on ticket changes.
 *
 * @route GET /api/tickets/events
 */
async function connectSSE(req, res) {
    try {
        await ticketService.connectSSE(req, res);
    } catch (error) {
        console.error("Error in SSE connection:", error);
        res.status(500).end();
    }
}

/**
 * Retrieves all archived tickets.
 * 
 * @route GET /api/tickets/archived
 */
async function getAllArchivedTickets(req, res) {
    try {
        const tickets = await ticketService.getAllArchivedTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching archived tickets:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Retrieves a single archived ticket by its ID.
 *
 * @route GET /api/tickets/archived/:id
 */
async function getArchivedTicketByID(req, res) {
   try {
        const ticket = await ticketService.getArchivedTicketById(req.params.id);
        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).json({ message: "Archived ticket not found" });
        }
    } catch (error) {
        console.error("Error fetching archived ticket:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

/**
 * Retrieves all notes associated with a specific ticket.
 * 
 * @route GET /api/tickets/:id/notes
 */
async function getTicketNotes(req, res) {
    try {
        const notes = await ticketService.getNotesByTicketId(req.params.id);
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Adds a new note to a ticket.
 *  @route POST /api/tickets/:id/notes
 * 
 * @param {string} req.body.note - The text content of the note.
 * @param {number} req.body.authorId - The ID of the user creating the note.
 */
async function addTicketNote(req, res) {
    try {
        const { note, authorId } = req.body; 
        if (!note || !authorId) {
            return res.status(400).json({ message: "Note text and Author ID are required." });
        }

        const newNote = await ticketService.addNote(req.params.id, note, authorId);
        res.status(201).json(newNote);
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { 
    getAllTickets, 
    createTicket, 
    getTicketById,
    updateTicket, 
    deleteTicket,
    getAllArchivedTickets,
    getArchivedTicketByID,
    connectSSE,
    getTicketNotes,
    addTicketNote,
    updateTicketStatus,
    assignTicketSelf,
    assignTicketUser    
};
