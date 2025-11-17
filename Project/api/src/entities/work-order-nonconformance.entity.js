const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrderNonconformance",
    tableName: "WorkOrder_Nonconformances",
    columns: {
        woId: {
            primary: true,
            type: "int",
            name: "WO_ID",
        },
        nonconId: {
            primary: true,
            type: "tinyint",
            name: "NONCON_ID",
        },
    },
    relations: {
        workOrder: {
            target: "WorkOrder",
            type: "many-to-one",
            joinColumn: {
                name: "WO_ID",
            },
        },
        nonconformance: {
            target: "ManNonCon", // Matches the name in manufact_noncon.entity.js
            type: "many-to-one",
            joinColumn: {
                name: "NONCON_ID",
            },
        },
    },
});