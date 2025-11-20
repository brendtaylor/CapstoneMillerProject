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
        const id = req.params.id;
        const ticket = await ticketService.getTicketById(id); 

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
        const id = req.params.id;
        const ticketData = req.body;
        const updatedTicket = await ticketService.updateTicket(id, ticketData);

        if (updatedTicket) {
            res.json(updatedTicket);
            // emitToMake is now handled by the service
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
async function deleteTicket(req, res) { // Renamed to match service
    try {
        const id = req.params.id;
        const result = await ticketService.deleteTicket(id); // Renamed to match service

        if (result) {
            res.status(200).json(result); // Send back success message
        } else {
            res.status(404).json({ message: "Ticket not found" });
        } 
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
        const archivedTickets = await ticketService.getAllArchivedTickets();
        res.json(archivedTickets);
    } catch (error) {
        console.error("Error fetching archived tickets:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Controller to handle getting a single archived ticket by ID
async function getArchivedTicketByID(req, res) {
    try {
        const id = req.params.id;
        const archivedTicket = await ticketService.getArchivedTicketByID(id);

        if (archivedTicket) {
            res.json(archivedTicket);
        } else {
            res.status(404).json({ error: "Archived ticket not found" });
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