const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Sequence",
    tableName: "MiHub_Sequence",
    columns: {
        seqID: {
            primary: true,
            type: "smallint",
            name: "SEQUENCE_ID",
            generated: false,
        },
        seqName: {
            type: "nvarchar",
            name: "SEQUENCE_NAME",
            length: 55,
            nullable: false,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "sequence",
        }
    }
});
