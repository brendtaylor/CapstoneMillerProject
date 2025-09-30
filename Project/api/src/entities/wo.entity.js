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
            type: "nvarchar",
            length: 100,
            name: "WO",
            nullable: true,
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
