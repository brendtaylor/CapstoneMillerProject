const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Image",
    tableName: "MiHub_Quality_Images", 
    columns: {
        ticketId: {
            type: "int",      
            name: "TICKETID",  
            nullable: false,        
        },
        id: {
            primary: true,
            type: "int",
            generated: "increment", // Assumes ID is an auto-incrementing key
            name: "ID",
        },
        imageKey: {
            type: "nvarchar",
            name: "ImageKey",
            length: "255",
            unique: true, // This is very important for searching
            nullable: false,
        },
        imageData: {
            type: "varbinary",
            name: "ImageData",
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
            joinColumn: {
                name: "TICKETID", 
                referencedColumnName: "ticketId",
            },
        },
    },
});
