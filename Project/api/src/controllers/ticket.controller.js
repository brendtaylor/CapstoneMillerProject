//Acts like the kitchen manager. Takes order from ticket.routes.js and delegates the task to the right station (service)

const ticketService = require("../services/ticket.service.js");
const { emitToMake } = require('../utils/makeEmitter.js');

// Controller to handle getting all tickets
async function getAllTickets(req, res) {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error); 
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Controller to handle creating a new ticket
async function createTicket(req, res) {
    try {
        // req.body contains the JSON data sent by the client
        const newTicket = await ticketService.createTicket(req.body);
        res.status(201).json(newTicket);
        emitToMake('ticket.create', { ticket: newTicket });
    } catch (error) {
        console.error("Error creating ticket:", error);
        //Check if the error is a validation error
        if (error.message.includes("cannot be empty")) {
            return res.status(400).json({ error: error.message });
        }
        //If its another kind of error, its a server error
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Controller for finding a specific ticket
async function getTicketByID(req, res) {
    try {
        //Get ID from the URL parameters
        const id = req.params.id;
        const ticket = await ticketService.getTicketByID(id);

        //If ticket is found, send it back
        if (ticket) {
            res.json(ticket);
        } else {
            //If the ticket is not found, send 404 error
            res.status(404).json({ error: "Ticket not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Controller for updating a specific ticket
async function updateTicket(req, res) {
    try {
        const id = req.params.id;
        const ticketData = req.body;
        const updatedTicket = await ticketService.updateTicket(id, ticketData);

        if (updatedTicket) {
            res.json(updatedTicket);                                                                //sending back the updated ticket
            emitToMake('ticket.update', { ticket: updatedTicket });
        } else {
            res.status(404).json({ error: "Ticket not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

//Controller for archiving a ticket
async function archiveTicket(req, res) {
    try {
        const id = req.params.id;
        const result = await ticketService.archiveTicket(id);

        if (result && result.affected > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: "Ticket not found" });
        } 
    } catch (error) {
        console.error("Error archiving ticket:", error);
        res.status(500).json({ error: "Internal Server Error" });
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

module.exports = { getAllTickets, createTicket, getTicketByID, updateTicket, archiveTicket };