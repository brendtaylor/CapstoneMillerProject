const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ManNonCon",
    tableName: "MiHub_Manufact_Noncon", 
    columns: {
        nonConId: {
            primary: true,
            type: "tinyint",
            name: "NONCON_ID",
            generated: false,
        },
        nonCon: {
            type: "varchar",
            name: "NONCON",
            length: 100,
            nullable: true,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "manNonCon",
        },
    },
});