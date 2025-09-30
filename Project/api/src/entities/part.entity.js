const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "PartNum",
    tableName: "MiHub_Part_Num", 
    columns: {
        partNumId: {
            primary: true,
            type: "int",
            name: "PART_NUM_ID",
            generated: false,
        },
        partNum: {
            type: "nvarchar",
            name: "PART_NUM",
            length: 55,
            nullable: false,
        },
    },

    relations: {
        tickets: {
        target: "Ticket",
        type: "one-to-many",
        inverseSide: "partNum",
        },
    },
});
