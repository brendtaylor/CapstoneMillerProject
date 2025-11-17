const ticketService = require("../services/ticket.service.js");
// Removed emitToMake, as the service now handles this
// const { emitToMake } = require('../utils/makeEmitter.js'); 

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
        // emitToMake is now handled by the service, no need to call it here.
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
async function getTicketById(req, res) { // Renamed to match service
    try {
        const id = req.params.id;
        const ticket = await ticketService.getTicketById(id); // Renamed to match service

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

// --- ADD THIS NEW FUNCTION ---
// Controller for handling Server-Sent Events (SSE)
async function connectSSE(req, res) {
    try {
        await ticketService.connectSSE(req, res);
    } catch (error) {
        console.error("Error in SSE connection:", error);
        res.status(500).end();
    }
}

// --- UPDATE MODULE EXPORTS ---
module.exports = { 
    getAllTickets, 
    createTicket, 
    getTicketById, // Renamed
    updateTicket, 
    deleteTicket, // Renamed
    connectSSE    // Added
};