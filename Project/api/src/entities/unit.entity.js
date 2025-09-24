const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Units",
    tableName: "units", 
    columns: {
        unit_id: {
            primary: true,
            type: "int",
        },
        unit_name: {
            type: "varchar",
        },
    },
});
