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
        const makeRs = await emitToMake('ticket.create', { ticket: newTicket });

        if (makeRs?.status === 'success') {
            console.log(`Email sent successfully for ${makeRs.event}`);
            // code if make succeeds
        } else {
            console.log(`Email failed to send for ${makeRs.event}. Error: ${makeRs.error}`);
            // code if make fails
        }
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
            res.json(updatedTicket);                                                                //sending back the updated ticket
            const makeRs = await emitToMake('ticket.update', { ticket: updatedTicket });

            if (makeRs?.status === 'success') {
                console.log(`Email sent successfully for ${makeRs.event}`);
                // code if make succeeds
            } else {
                console.log(`Email failed to send for ${makeRs.event}. Error: ${makeRs.error}`);
                // code if make fails
            }
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
        const archiveData = req.body || {};
        const result = await ticketService.deleteTicket(req.params.id, archiveData);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error archiving ticket:", error);
        if (error.message && error.message.startsWith("Validation Error:")) {
            return res.status(400).json({ message: error.message.replace("Validation Error: ", "") });
        }
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
