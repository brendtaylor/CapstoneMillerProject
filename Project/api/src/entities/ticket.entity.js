//Description: These are the object-oriented representations of the tables in the database. 
//Entity files define the structure of the data and the relationships between tables
//These are the ingredients in our analogy

const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
    name: "Ticket", 
    tableName: "MiHubWeb_Quality_Tickets", 
    columns: {
        ticketId: {
            primary: true,      //primary key
            type: "int",
            generated: true,      //auto-generate ticketId number
            name: "TICKETID",          
        },
        openDate: {
            type: "datetime",
            name: "OPEN_DATE",
            nullable: false,         // idkkkkk
        },
        closeDate: {
            type: "datetime",
            name: "CLOSE_DATE",
            nullable: true,         // idkkkkkkk
        },
        description: {
            type: "nvarchar",
            name: "DESCRIPTION",
            length: "max",
            nullable: true,
        },
        status: {
            type: "tinyint",
            name: "STATUS"
        },
        initiator: {
            type: "smallint",
            name: "INITIATOR"
        }, 
        division: {
            type: "smallint",
            name: "DIVISION"
        },
        drawingNum: {
            type: "int",
            name: "DRAWING_NUM"
        },
        manNonCon: {
            type: "tinyint",
            name: "MANUFACTURING_NONCONFORMANCE"
        },
        partNum: {
            type: "int",
            name: "PART_NUM"
        },
        sequence: {
            type: "smallint",
            name: "SEQUENCE"
        },
        unit: {
            type: "smallint",
            name: "UNIT"
        },
        wo: {
            type: "int",
            name: "WO"
        }
    },

    relations: {
        status: {
            target: "Status", // This will be the 'name' in ticket-status.entity.js
            type: "many-to-one",
            joinColumn: {
                name: "STATUS", // The foreign key column in this table
            },
        },
        initiator: {                      
            target: "User", // The 'name' in user.entity.js
            type: "many-to-one",
            joinColumn: {
                name: "INITIATOR",
            },
        }, 
        division: {
            target: "Division",
            type: "many-to-one",
            joinColumn: {
                name: "DIVISION",
            },
        },
        drawingNum: {
            target: "DrawingNum",
            type: "many-to-one",
            joinColumn: {
                name: "DRAWING_NUM",
            }
        },
        manNonCon: {
            target: "ManNonCon",
            type: "many-to-one",
            joinColumn: {
                name: "MANUFACTURING_NONCONFORMANCE",
            }
        },
        partNum: {
            target: "PartNum",
            type: "many-to-one",
            joinColumn: {
                name: "PART_NUM",
            }
        },
        sequence: {
            target: "Sequence",
            type: "many-to-one",
            joinColumn: {
                name: "SEQUENCE",
            }
        },
        unit: {
            target: "Unit",
            type: "many-to-one",
            joinColumn: {
                name: "UNIT",
            }
        },
        wo: {
            target: "WorkOrder",
            type: "many-to-one",
            joinColumn: {
                name: "WO",
            }
        }
    },
});