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
        // Service handles DB creation AND 'emitToMake' logic now
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
        // Service handles DB update AND 'emitToMake' logic now
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

module.exports = { 
    getAllTickets, 
    createTicket, 
    getTicketById,
    updateTicket, 
    deleteTicket,
    getAllArchivedTickets,
    getArchivedTicketByID,
    connectSSE    
};