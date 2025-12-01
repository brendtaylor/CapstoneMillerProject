const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "File",
    tableName: "MiHub_Quality_Attachments", 
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment", // Assumes ID is an auto-incrementing key
            name: "ID",
        },
        fileKey: {
            type: "nvarchar",
            name: "FileKey",
            length: "255",
            unique: true, // This is very important for searching
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
            type: "many-to-one", // An image belongs to one ticket
            inverseSide: "files", // The property on the Ticket entity that refers to these files
            joinColumn: {
                name: "TICKETID", // The column in this table
                referencedColumnName: "ticketId", // The column in the "Ticket" table
            },
        },
    },
});
