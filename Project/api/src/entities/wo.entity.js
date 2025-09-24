const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrders",
    tableName: "work_orders", 
    columns: {
        wo_id: {
            primary: true,
            type: "int",
        },
        wo_name: {
            type: "varchar",
        },
    },
});
