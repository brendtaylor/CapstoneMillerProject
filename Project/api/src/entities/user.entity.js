const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "User",
    tableName: "MiHub_Quality_Users", 
    schema: "dbo", 
    columns: {
        id: {
            primary: true,
            type: "smallint",
            name: "ID",
            generated: false,
        },
        role: {
            type: "tinyint",
            name: "ROLE",
        },
        name: {
            type: "nvarchar",
            length: 55,
            name: "NAME",
        },
        email: {
            type: "nvarchar",
            length: 55,
            name: "EMAIL",
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "initiator", 
        },
    },
});
