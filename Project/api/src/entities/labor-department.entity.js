const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "LaborDepartment",
    tableName: "MiHub_Labor_Department",
    columns: {
        departmentId: {
            primary: true,
            type: "smallint",
            name: "DEPARTMENT_ID",
        },
        departmentName: {
            type: "varchar",
            length: 255,
            name: "DEPARTMENT_NAME",
            nullable: false,
        },
    },
});