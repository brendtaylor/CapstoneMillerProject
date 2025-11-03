//Description: This file contains the repositories that we use to interact with the database
//provides methods that are translated from JS to SQL queries
//The Chef in the kitchen analogy. Validates data and combines database interactions to get the final product

const { AppDataSource } = require("../data-source");
const TicketEntity = require("../entities/ticket.entity.js");
const ArchivedTicketEntity = require("../entities/archived-ticket.entity.js");

// Get the repository for the Ticket entity
const ticketRepository = AppDataSource.getRepository(TicketEntity);
const archivedTicketRepository = AppDataSource.getRepository(ArchivedTicketEntity);


// Define relations to be loaded with tickets
const ticketRelations = [
    "status", "initiator", "wo", "unit", "sequence",
    "division", "manNonCon", "drawingNum", "partNum"
];

// Function to get all tickets
async function getAllTickets() {
    return ticketRepository.find({ relations: ticketRelations });
}

// Function to create a new ticket
async function createTicket(ticketData) {
    const newTicket = ticketRepository.create(ticketData);
    const savedTicket = await ticketRepository.save(newTicket);
    //Validation Logic
    //Check if title field is empty
   // if(!ticketData.title || ticketData.title.trim() === ""){
    //    throw new Error("Ticket title cannot be empty.");
    //}
    // The save method creates a new record if it doesn't exist
    return getTicketByID(savedTicket.ticketId);
}

//Find a specific ticket by its ID
async function getTicketByID(id) {
    return ticketRepository.findOne({ 
        where: {ticketId: parseInt(id) },
        relations: ticketRelations,
    });
}

//Update a specific ticket 
async function updateTicket(id, ticketData) {
    const ticketId = parseInt(id);
    await ticketRepository.update(ticketId, ticketData);
    // Re-fetch updated ticket to include all relations
    return getTicketByID(ticketId);
}


//Archive a specific ticket
async function archiveTicket(id) {
    const ticketId = parseInt(id);
    const ticketToArchive = await ticketRepository.findOneBy({ ticketId: ticketId });

    if (!ticketToArchive) {
        return null;
    }

    //Create a new archived ticket record
    const archivedTicket = archivedTicketRepository.create(ticketToArchive);
    await archivedTicketRepository.save(archivedTicket);

    //Delete the original ticket
    return ticketRepository.delete({ ticketId: ticketId });
}
module.exports = { getAllTickets, createTicket, getTicketByID, updateTicket, archiveTicket };