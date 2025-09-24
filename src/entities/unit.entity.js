const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Units",
    tableName: "units", 
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
