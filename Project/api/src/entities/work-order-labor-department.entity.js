const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "WorkOrderLaborDepartment",
    tableName: "WorkOrder_LaborDepartments",
    columns: {
        woId: {
            primary: true,
            type: "int",
            name: "WO_ID",
        },
        departmentId: {
            primary: true,
            type: "smallint",
            name: "DEPARTMENT_ID",
        },
    },
    relations: {
        workOrder: {
            target: "WorkOrder",
            type: "many-to-one",
            joinColumn: {
                name: "WO_ID",
            },
        },
        laborDepartment: {
            target: "LaborDepartment",
            type: "many-to-one",
            joinColumn: {
                name: "DEPARTMENT_ID",
            },
        },
    },
});