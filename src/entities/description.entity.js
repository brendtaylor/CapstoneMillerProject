const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Description",
    tableName: "descriptions",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        text: {
            type: "nvarchar",
        },
    },
});