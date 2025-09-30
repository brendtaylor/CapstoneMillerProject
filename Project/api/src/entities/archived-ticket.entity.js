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
        },
        sequence: {
            type: "smallint",
            name: "SEQUENCE",
        },
        division: {
            type: "smallint",
            name: "DIVISION",
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
            type: "int",
            name: "DRAWING_NUM",
        },
        partNum: {
            type: "int",
            name: "PART_NUM",
        },
        // This is the corrected version
        description: {
            type: "nvarchar",
            length: "max",
            name: "DESCRIPTION",
            nullable: true,
        },
    },
});