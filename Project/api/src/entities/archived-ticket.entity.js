const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "ArchivedTicket",
    tableName: "MiHubWeb_Quality_Tickets_Archive", 
    columns: {
        ticketId: {
            primary: true,
            type: "int",
            name: "TICKETID",
            generated: false, // Not auto-generated in the archive table
        },
        qualityTicketId: {
            type: "nvarchar",
            length: 100,
            nullable: true,
            name: "QUALITY_TICKET_ID",
        },
        status: {
            type: "tinyint",
            name: "STATUS",
        },
        initiator: {
            type: "smallint",
            name: "INITIATOR",
        },
        wo: {
            type: "int",
            name: "WO",
        },
        unit: {
            type: "smallint",
            name: "UNIT",
            nullable: true, 
        },
        sequence: {
            type: "smallint",
            name: "SEQUENCE",
        },
        division: {
            type: "smallint",
            name: "DIVISION",
        },
        laborDepartment: { 
            type: "smallint",
            name: "LABOR_DEPARTMENT"
        },
        openDate: {
            type: "datetime",
            name: "OPEN_DATE",
        },
        closeDate: {
            type: "datetime",
            name: "CLOSE_DATE",
            nullable: true,
        },
        manNonCon: {
            type: "tinyint",
            name: "MANUFACTURING_NONCONFORMANCE",
        },
        drawingNum: {
            type: "nvarchar", 
            length: 55,       
            nullable: true,   
            name: "DRAWING_NUM"
        },
        description: {
            type: "nvarchar",
            length: "max",
            name: "DESCRIPTION",
            nullable: true,
        },
        assignedTo: { 
            type: "smallint",
            name: "ASSIGNED_TO",
            nullable: true,
        },
        estimatedLaborHours: { 
            type: "decimal",
            precision: 10,
            scale: 2,
            name: "ESTIMATED_LABOR_HOURS",
            nullable: true,
        },
        correctiveAction: {
            type: "nvarchar",
            length: "max",
            name: "CORRECTIVE_ACTION",
            nullable: true,
        },
        materialsUsed: { 
            type: "nvarchar",
            length: "max",
            name: "MATERIALS_USED",
            nullable: true,
        }
    },

    relations: {
        status: {
            target: "Status",
            type: "many-to-one",
            joinColumn: { name: "STATUS" },
        },
        initiator: {                      
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "INITIATOR" },
        }, 
        division: {
            target: "Division",
            type: "many-to-one",
            joinColumn: { name: "DIVISION" },
        },
        manNonCon: {
            target: "ManNonCon",
            type: "many-to-one",
            joinColumn: { name: "MANUFACTURING_NONCONFORMANCE" }
        },
        laborDepartment: {
            target: "LaborDepartment",
            type: "many-to-one",
            joinColumn: { name: "LABOR_DEPARTMENT" },
        },
        sequence: {
            target: "Sequence",
            type: "many-to-one",
            joinColumn: { name: "SEQUENCE" }
        },
        unit: {
            target: "Unit",
            type: "many-to-one",
            joinColumn: { name: "UNIT" }
        },
        wo: {
            target: "WorkOrder",
            type: "many-to-one",
            joinColumn: { name: "WO" }
        },
        assignedTo: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ASSIGNED_TO" }
        }
    },
});