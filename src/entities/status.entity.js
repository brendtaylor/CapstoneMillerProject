const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Status",
    tableName: "status", 
    columns: {
        status_id: {
            primary: true,
            type: "int",
        },
        description: {
            type: "varchar",
        },
    },
});
