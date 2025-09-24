const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrders",
    tableName: "work_orders", 
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
