const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Ticket", 
    tableName: "MiHubWeb_Quality_Tickets", 
    columns: {
        ticketId: {
            primary: true,
            type: "int",
            generated: true,
            name: "TICKETID",          
        },
        qualityTicketId: {
            type: "nvarchar",
            length: 100,
            nullable: true,
            name: "QUALITY_TICKET_ID",
        },
        openDate: {
            type: "datetime",
            name: "OPEN_DATE",
            nullable: false,         
        },
        closeDate: {
            type: "datetime",
            name: "CLOSE_DATE",
            nullable: true,        
        },
        lastReopenDate: {
            type: "datetime",
            name: "LAST_REOPEN_DATE",
            nullable: true,
        },
        description: {
            type: "nvarchar",
            name: "DESCRIPTION",
            length: "max",
            nullable: true,
        },
        drawingNum: {
            type: "nvarchar",
            length: 55,
            nullable: true,
            name: "DRAWING_NUM"
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
            joinColumn: { name: "MANUFACTURING_NONCONFORMANCE" },
        },
        laborDepartment: {
            target: "LaborDepartment",
            type: "many-to-one",
            joinColumn: { name: "LABOR_DEPARTMENT" },
        },
        sequence: {
            target: "Sequence",
            type: "many-to-one",
            joinColumn: { name: "SEQUENCE" },
        },
        unit: {
            target: "Unit",
            type: "many-to-one",
            joinColumn: { name: "UNIT" },
        },
        wo: {
            target: "WorkOrder",
            type: "many-to-one",
            joinColumn: { name: "WO" },
        },
        assignedTo: {
            target: "User",
            type: "many-to-one",
            joinColumn: { name: "ASSIGNED_TO" },
        },
        files: {
            target: "File", 
            type: "one-to-many", 
            inverseSide: "ticket", 
        },
        closures: {
            target: "TicketClosure",
            type: "one-to-many",
            inverseSide: "ticket",
            cascade: true, 
        },
        notes: {
            target: "Note",
            type: "one-to-many",
            inverseSide: "ticket",
            cascade: true,
        },
    },
});
