const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "DrawingNums",
    tableName: "drawing_nums", 
    columns: {
        drawing_id: {
            primary: true,
            type: "int",
        },
        drawing_num: {
            type: "varchar",
        },
    },
});
