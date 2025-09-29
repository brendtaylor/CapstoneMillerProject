//Acts like the Waiter in a restaurant. Takes in requests and forwards them to the controller.
//defines the possible actions that a customer can request

const express = require("express");
const ticketController = require("../controllers/ticket.controller.js");
const router = express.Router();

// Route for GET request to '/' (which is '/api/tickets/')
router.get("/", ticketController.getAllTickets);

// Route for POST request to '/' (which is '/api/tickets/')
router.post("/", ticketController.createTicket);

//Route for GET request to ('/api/tickets/')
router.get("/:id", ticketController.getTicketByID);

//Route for PUT request to (/api/tickets/')
router.put("/:id", ticketController.updateTicket);

//Route for DELETE request to ('/api/tickets/')
router.delete("/:id", ticketController.archiveTicket);
module.exports = router;