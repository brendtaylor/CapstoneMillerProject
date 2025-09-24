const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ManufacturingNonconformance",
    tableName: "manufact_noncon", 
    columns: {
        noncon_id: {
            primary: true,
            type: "int",
        },
        noncon_title: {
            type: "varchar",
        },
    },
});
