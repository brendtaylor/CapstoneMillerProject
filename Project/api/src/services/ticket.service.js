//Description: This file contains the repositories that we use to interact with the database
//provides methods that are translated from JS to SQL queries
//The Chef in the kitchen analogy. Validates data and combines database interactions to get the final product

const { AppDataSource } = require("../data-source");
const TicketEntity = require("../entities/ticket.entity.js");
const ArchivedTicketEntity = require("../entities/archived-ticket.entity.js");

//  Import all related entities 
const UserEntity = require("../entities/user.entity.js");
const StatusEntity = require("../entities/status.entity.js");
const DivisionEntity = require("../entities/division.entity.js");
const DrawingNumEntity = require("../entities/drawing.entity.js");
const ManNonConEntity = require("../entities/manufact_noncon.entity.js");
const PartNumEntity = require("../entities/part.entity.js");
const SequenceEntity = require("../entities/sequence.entity.js");
const UnitEntity = require("../entities/unit.entity.js");
const WorkOrderEntity = require("../entities/wo.entity.js");



// Get the repository for the Ticket entity
const ticketRepository = AppDataSource.getRepository(TicketEntity);
const archivedTicketRepository = AppDataSource.getRepository(ArchivedTicketEntity);

// Get repositories for all related entities
const userRepository = AppDataSource.getRepository(UserEntity);
const statusRepository = AppDataSource.getRepository(StatusEntity);
const divisionRepository = AppDataSource.getRepository(DivisionEntity);
const drawingNumRepository = AppDataSource.getRepository(DrawingNumEntity);
const manNonConRepository = AppDataSource.getRepository(ManNonConEntity);
const partNumRepository = AppDataSource.getRepository(PartNumEntity);
const sequenceRepository = AppDataSource.getRepository(SequenceEntity);
const unitRepository = AppDataSource.getRepository(UnitEntity);
const workOrderRepository = AppDataSource.getRepository(WorkOrderEntity);



// Define relations to be loaded with tickets
const ticketRelations = [
    "status", "initiator", "wo", "unit", "sequence",
    "division", "manNonCon", "drawingNum", "partNum"
];

// Validation Helper Function
async function validateTicketData(ticketData) {
    // Check for required fields
    const requiredFields = {
        status: "Status",
        initiator: "Initiator",
        wo: "Work Order",
        sequence: "Sequence",
        division: "Division",
        manNonCon: "Manufacturing Nonconformance",
        drawingNum: "Drawing Number",
        partNum: "Part Number"
    };

    for (const field in requiredFields) {
        //check for null and undefined values
        if (ticketData[field] == null) {
            // Add prefix for the controller to catch
            throw new Error(`Validation Error: ${requiredFields[field]} is a required field. Please select a valid option from the drop-down menu.`);
        }
    }

    
    // database checks run concurrently. Checks to see if the data exists in the reference table
    const checks = [
        { repo: statusRepository, id: ticketData.status, name: "Status", key: "statusId" },
        //{ repo: userRepository, id: ticketData.initiator, name: "Initiator", key: "id" },
        { repo: workOrderRepository, id: ticketData.wo, name: "Work Order", key: "woId" },
        { repo: sequenceRepository, id: ticketData.sequence, name: "Sequence", key: "seqID" },
        { repo: divisionRepository, id: ticketData.division, name: "Division", key: "divisionId" },
        { repo: manNonConRepository, id: ticketData.manNonCon, name: "Manufacturing Nonconformance", key: "nonConId" },
        { repo: drawingNumRepository, id: ticketData.drawingNum, name: "Drawing Number", key: "drawingId" },
        { repo: partNumRepository, id: ticketData.partNum, name: "Part Number", key: "partNumId" }
    ];

    // 'unit' is nullable, only check it if it's provided
    if (ticketData.unit != null) {
        checks.push({ repo: unitRepository, id: ticketData.unit, name: "Unit", key: "unitId" });
    }

    //if the data doesnt exist in reference tables, throw the following error
    const validationPromises = checks.map(async (check) => {
        const exists = await check.repo.findOneBy({ [check.key]: check.id });
        if (!exists) {
            throw new Error(`Validation Error: ${check.name} ID '${check.id}' does not exist.`);
        }
    });

    await Promise.all(validationPromises);
}



// Function to get all tickets
async function getAllTickets() {
    return ticketRepository.find({ relations: ticketRelations });
}

// Function to create a new ticket
async function createTicket(ticketData) {
    
    // Run all validations before ticket creation
    await validateTicketData(ticketData);

    const newTicket = ticketRepository.create(ticketData);
    const savedTicket = await ticketRepository.save(newTicket);
    
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
    
    // First, get the existing ticket data
    const existingTicket = await getTicketByID(ticketId);
    if (!existingTicket) {
        // This will be caught by the controller and turned into a 404
        throw new Error("Ticket not found"); 
    }

    // Merge new data over existing data for validation
    const mergedData = { ...existingTicket, ...ticketData };

    // Run validations for update
    await validateTicketData(mergedData);

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

//fetch all archived tickets
async function getAllArchivedTickets() {
    return archivedTicketRepository.find({ relations: ticketRelations });
}

//fetch a specific archived ticket by its ID
async function getArchivedTicketByID(id) {
    return archivedTicketRepository.findOne({
        where: { ticketId: parseInt(id) },
        relations: ticketRelations,
    });
}

module.exports = { getAllTickets, createTicket, getTicketByID, updateTicket, archiveTicket };