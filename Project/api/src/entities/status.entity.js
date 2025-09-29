const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Status",
    tableName: "MiHub_Quality_Ticket_Status", 
    columns: {
        statusId: {
            primary: true,
            type: "tinyint",
            name: "STATUS_ID",
            generated: false,
        },
        statusDescription: {
            type: "varchar",
            length: "max",
            name: "STATUS_DESCRIPTION",
            nullable: true,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "status"
        }
    }
});
