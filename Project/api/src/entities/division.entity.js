const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Division",
    tableName: "MiHub_Divisions", 
    columns: {
        divisionId: {
            primary: true,
            type: "smallint",
            name: "DIVISION_ID",
        },
        divisionName: {
            type: "varchar",
            length: 255,
            name: "DIVISION_NAME",
            nullable: false,
        },
    },
    relations: {
        tickets: {
            target: "Ticket",                                      //points back to the Ticket entity
            type: "one-to-many",                                    //One division can have many tickets
            inverseSide: "division",                                //Links to the 'division' property in the Ticket entity
        },
    },
});
