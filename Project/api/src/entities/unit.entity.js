const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Unit",
    tableName: "MiHub_WO_Unit", 
    columns: {
        unitId: {
            primary: true,
            type: "smallint",
            name: "UNIT_ID",
            generated: false,
        },
        unitName: {
            name: "UNIT_NAME",
            type: "nvarchar",
            length: 55,
            nullable: true,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "unit"
        }
    }
});
