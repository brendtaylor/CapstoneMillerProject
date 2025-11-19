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
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Controller to handle creating a new ticket
async function createTicket(req, res) {
    try {
        // req.body contains the JSON data sent by the client
        const newTicket = await ticketService.createTicket(req.body);
        res.status(201).json(newTicket);
        const makeRs = await emitToMake('ticket.create', { ticket: newTicket });

        if (makeRs?.status === 'success') {
            // code if make succeeds
        } else {
            // code if make fails
        }
    } catch (error) {
        console.error("Error creating ticket:", error);
        
        // Catch ANY error starting with "Validation Error:"
        if (error.message.startsWith("Validation Error:")) {
            const friendlyErrorMessage = error.message.replace("Validation Error: ", "");
            return res.status(400).json({ message: friendlyErrorMessage });
        }
        
        //If its not a validation error its a server error
        res.status(500).json({ message: "Internal Server Error" });
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
            res.json(updatedTicket);                                                                //sending back the updated ticket
            const makeRs = await emitToMake('ticket.update', { ticket: updatedTicket });

            if (makeRs?.status === 'success') {
                // code if make succeeds
            } else {
                // code if make fails
            }
        } else {
            res.status(404).json({ message: "Ticket not found" });
        }
    } catch (error) {
        console.error("Error updating ticket:", error);

        // Catch validation errors
        if (error.message.startsWith("Validation Error:")) {
            const friendlyErrorMessage = error.message.replace("Validation Error: ", "");
            return res.status(400).json({ message: friendlyErrorMessage });
        }

        // Catch the specific "Not Found" error from the service
        if (error.message === "Ticket not found") {
            return res.status(404).json({ message: "Ticket not found" });
        }
       

        res.status(500).json({ message: "Internal Server Error" });
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
            res.status(404).json({ message: "Ticket not found" });
        } 
    } catch (error) {
        console.error("Error archiving ticket:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = { getAllTickets, createTicket, getTicketByID, updateTicket, archiveTicket };