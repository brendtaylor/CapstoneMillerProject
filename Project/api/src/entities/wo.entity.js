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
            type: "int",
            length: 100,
            name: "WO",
            nullable: false,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "workOrder",
        },
    },
});
