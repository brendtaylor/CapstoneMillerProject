const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrder",
    tableName: "MiHub_WO",
    columns: {
        woId: {
            name: "WO_ID",
            primary: true,
            type: "int",
            generated: false
        },
        wo: {
            type: "varchar",
            name: "WO",
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "wo", 
        },
    },
});