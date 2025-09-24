const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Divisions",
    tableName: "divisions", 
    columns: {
        id: {
            primary: true,
            type: "int",
        },
        name: {
            type: "varchar",
        },
    },
});
