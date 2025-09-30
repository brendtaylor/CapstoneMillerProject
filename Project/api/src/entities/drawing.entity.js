const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "DrawingNum",
    tableName: "MiHub_Drawing_Num", 
    columns: {
        drawingId: {
            primary: true,
            type: "int",
            name: 'DRAWING_NUM_ID',
        },
        drawing_num: {
            type: "nvarchar",
            name: 'DRAWING_NUM',
            nullable: true,
        },
    },
     relations: {
        tickets: {
            target: "Ticket",
            type: "one-to-many",
            inverseSide: "drawingNum",
        },
    },
});
