//Description: This file contains the repositories that we use to interact with the database
//provides methods that are translated from JS to SQL queries
//The Chef in the kitchen analogy. Validates data and combines database interactions to get the final product

const { AppDataSource } = require("../data-source");
const TicketEntity = require("../entities/ticket.entity.js");
const ArchivedTicketEntity = require("../entities/archived-ticket.entity.js");

// Get the repository for the Ticket entity
const ticketRepository = AppDataSource.getRepository(TicketEntity);
const archivedTicketRepository = AppDataSource.getRepository(ArchivedTicketEntity);

// Function to get all tickets
async function getAllTickets() {
    return ticketRepository.find();
}

// Function to create a new ticket
async function createTicket(ticketData) {
    //Validation Logic
    //Check if title field is empty
    if(!ticketData.title || ticketData.title.trim() === ""){
        throw new Error("Ticket title cannot be empty.");
    }
    // The save method creates a new record if it doesn't exist
    return ticketRepository.save(ticketData);
}

//Find a specific ticket by its ID
async function getTicketByID(id) {
    return ticketRepository.findOneBy({ id: id});
}

//Update a specific ticket 
async function updateTicket(id, ticketData) {
    //find the ticket to be updated
    const ticketToUpdate = await ticketRepository.findOneBy({ id: id});

    //If the Ticket ID  does not exist
    if (!ticketToUpdate) {
        return null;
    }

    //Validate Ticket Title field
    if (!ticketData.title !== undefined && ticketData.title.trim() === "") {
        throw new Error("Ticket title cannot be empty.");
    }
    //Merge the new data into the existing ticket
    Object.assign(ticketToUpdate, ticketData);

    //Save the updated ticket back to the database
    return ticketRepository.save(ticketToUpdate);
}

//Archive a specific ticket
async function archiveTicket(id) {
    //find the ticket to be archived
    const ticketToArchive = await ticketRepository.findOneBy({ id: id});

    //If the Ticket ID does not exist
    if (!ticketToArchive){
        return null;
    }

    await archivedTicketRepository.save(ticketToArchive);

    return ticketRepository.delete({ id: id });
}
module.exports = { getAllTickets, createTicket, getTicketByID, updateTicket, archiveTicket };