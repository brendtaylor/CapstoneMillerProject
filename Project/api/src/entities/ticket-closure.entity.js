const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "TicketClosure",
    tableName: "MiHubWeb_Quality_Ticket_Closures",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
            name: "ID",
        },
        cycleStartDate: {                                                                   // When this specific cycle opened/re-opened
            type: "datetime",
            name: "CYCLE_START_DATE",
            nullable: true,
        },
        cycleCloseDate: {                                                                   // When this specific cycle ended
            type: "datetime",
            name: "CYCLE_CLOSE_DATE",
        },
        correctiveAction: {
            type: "nvarchar",
            length: "max",
            nullable: true,
            name: "CORRECTIVE_ACTION",
        },
        materialsUsed: {
            type: "nvarchar",
            length: "max",
            nullable: true,
            name: "MATERIALS_USED",
        },
        estimatedLaborHours: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: true,
            name: "ESTIMATED_LABOR_HOURS",
        },
    },
    relations: {
        ticket: {
            target: "Ticket",
            type: "many-to-one",
            joinColumn: { name: "TICKET_ID" },
            onDelete: "CASCADE",
        },
        closedBy: {
             target: "User",
             type: "many-to-one",
             joinColumn: { name: "CLOSED_BY" },
             nullable: true
        }
    },
});