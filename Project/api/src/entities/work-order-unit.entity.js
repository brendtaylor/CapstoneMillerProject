const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrderUnit",
    tableName: "WorkOrder_Units",
    columns: {
        woId: {
            primary: true,
            type: "int",
            name: "WO_ID",
        },
        unitId: {
            primary: true,
            type: "smallint",
            name: "UNIT_ID",
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
        unit: {
            target: "Unit",
            type: "many-to-one",
            joinColumn: {
                name: "UNIT_ID",
            },
        },
    },
});