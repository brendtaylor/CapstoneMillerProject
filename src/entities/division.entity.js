const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Divisions",
    tableName: "divisions", 
    columns: {
        division_id: {
            primary: true,
            type: "int",
        },
        division_name: {
            type: "varchar",
        },
    },
});
