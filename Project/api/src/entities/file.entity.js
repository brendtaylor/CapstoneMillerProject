const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "File",
    tableName: "MiHub_Quality_Attachments", 
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment", 
            name: "ID",
        },
        fileKey: {
            type: "nvarchar",
            name: "FileKey",
            length: "255",
            unique: true, 
            nullable: false,
        },
        fileName:{
            type: "nvarchar",
            name: "FileName",
            length: "255",
            nullable: false,
        },
        fileData: {
            type: "varbinary",
            name: "FileData",
            length: "max",
            nullable: false,
        },
        mimeType: {
            type: "nvarchar",
            name: "MimeType",
            length: "100",
            nullable: false,
        }
    },
    relations: {
        ticket: {
            target: "Ticket", 
            type: "many-to-one", 
            inverseSide: "files", 
            joinColumn: {
                name: "TICKETID", 
                referencedColumnName: "ticketId", 
            },
            nullable: true, // Allow null if moved to archive
        },
        // NEW RELATION
        archivedTicket: {
            target: "ArchivedTicket",
            type: "many-to-one",
            inverseSide: "files",
            joinColumn: {
                name: "ARCHIVED_TICKET_ID",
            },
            nullable: true,
        },
    },
});