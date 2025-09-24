const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Sequence",
    tableName: "sequence_names",
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
