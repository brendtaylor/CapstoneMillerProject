const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ArchivedTicket",
    tableName: "archived_tickets", 
    columns: {
        id: {
            primary: true,
            type: "int",
        },
        title: {
            type: "varchar",
        },
        description: {
            type: "text",
        },
        status: {
            type: "varchar",
        },
    },
});