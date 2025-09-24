const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Sequence",
    tableName: "Sequence",
    columns: {
        sequence_id: {
            primary: true,
            type: "int",
        },
        name: {
            type: "varchar",
        },
    },
});
