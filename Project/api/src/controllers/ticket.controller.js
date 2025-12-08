const ticketService = require("../services/ticket.service.js");

// Controller to handle getting all tickets
async function getAllTickets(req, res) {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error); 
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Controller to handle creating a new ticket
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

//Controller for finding a specific ticket
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

//Controller for updating a specific ticket
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

async function updateTicketStatus(req, res) {
    try {
        // Extract status and the rest of the body (closing fields)
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


async function assignTicketUser(req, res) {
    try {
        const { userId } = req.params; // Get the ID from the URL parameter
        
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

//Controller for deleting (archiving) a ticket
async function deleteTicket(req, res) { 
    try {
        const result = await ticketService.deleteTicket(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error archiving ticket:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


// Controller for handling Server-Sent Events (SSE)
async function connectSSE(req, res) {
    try {
        await ticketService.connectSSE(req, res);
    } catch (error) {
        console.error("Error in SSE connection:", error);
        res.status(500).end();
    }
}

//Controller to handle getting all archived tickets
async function getAllArchivedTickets(req, res) {
    try {
        const tickets = await ticketService.getAllArchivedTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching archived tickets:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//Controller to handle getting a single archived ticket by ID
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

async function getTicketNotes(req, res) {
    try {
        const notes = await ticketService.getNotesByTicketId(req.params.id);
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

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