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
            default: () => "GETDATE()", // Let SQL Server handle the default
        },
    },
    relations: {
        ticket: {
            target: "Ticket",
            type: "many-to-one",
            joinColumn: { name: "TICKET_ID" },
            onDelete: "CASCADE",
        },
        author: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "AUTHOR_ID" },
        },
    },
});