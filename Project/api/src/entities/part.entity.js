const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "PartNumbers",
    tableName: "part_nums", 
    columns: {
        part_id: {
            primary: true,
            type: "int",
        },
        part_num: {
            type: "varchar",
        },
    },
});
