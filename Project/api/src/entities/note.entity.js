const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Note",
    tableName: "MiHubWeb_Quality_Ticket_Notes",
    columns: {
        noteId: {
            primary: true,
            type: "int",
            generated: true,
            name: "NOTE_ID",
        },
        text: {
            type: "nvarchar",
            length: "max",
            name: "NOTE_TEXT",
        },
        createdAt: {
            type: "datetime",
            name: "CREATED_AT",
            default: () => "GETDATE()", 
        },
    },
    relations: {
        ticket: {
            target: "Ticket",
            type: "many-to-one",
            joinColumn: { name: "TICKET_ID" },
            onDelete: "CASCADE",
            nullable: true, // Allow null if moved to archive
        },
        // NEW RELATION
        archivedTicket: {
            target: "ArchivedTicket",
            type: "many-to-one",
            joinColumn: { name: "ARCHIVED_TICKET_ID" },
            onDelete: "CASCADE",
            nullable: true,
        },
        author: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "AUTHOR_ID" },
        },
    },
});