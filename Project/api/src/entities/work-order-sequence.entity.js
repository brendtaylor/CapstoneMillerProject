const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrderSequence",
    tableName: "WorkOrder_Sequences",
    columns: {
        woId: {
            primary: true,
            type: "int",
            name: "WO_ID",
        },
        sequenceId: {
            primary: true,
            type: "smallint",
            name: "SEQUENCE_ID",
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
        sequence: {
            target: "Sequence",
            type: "many-to-one",
            joinColumn: {
                name: "SEQUENCE_ID",
            },
        },
    },
});