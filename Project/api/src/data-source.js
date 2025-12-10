/**
 * @file data-source.js
 * Database configuration file using TypeORM.
 * - Establishes the connection to the MSSQL Server.
 * - Registers all Entity schemas for Object-Relational Mapping.
 * - Configures connection pooling (max 120 concurrent connections).
 * - Sets up file-based logging for SQL queries.
 */

const { DataSource } = require("typeorm");

// Import all entity schemas
const Ticket = require("./entities/ticket.entity");
const User = require("./entities/user.entity");
const Status = require("./entities/status.entity");
const Division = require("./entities/division.entity");
const ManNonCon = require("./entities/manufact_noncon.entity");
const Sequence = require("./entities/sequence.entity");
const Unit = require("./entities/unit.entity");
const WorkOrder = require("./entities/wo.entity");
const ArchivedTicket = require("./entities/archived-ticket.entity");
const LaborDepartment = require ("./entities/labor-department.entity");
const WorkOrderLaborDepartment = require ("./entities/work-order-labor-department.entity");
const WorkOrderNonconformance = require ("./entities/work-order-nonconformance.entity");
const WorkOrderSequence = require ("./entities/work-order-sequence.entity");
const WorkOrderUnit = require ("./entities/work-order-unit.entity");
const File = require("./entities/file.entity");
const AuditLog = require("./entities/audit-log.entity.js");
const TicketClosure = require("./entities/ticket-closure.entity");
const Note = require("./entities/note.entity");


const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,    
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,        
    
    extra: {
        pool: {
            max: 120,  // Allow up to 120 concurrent DB connections
            min: 5,   // Keep 5 ready at all times to reduce initial latency
            idleTimeoutMillis: 30000 
        }
    },

    entities: [
        Ticket,
        User,
        Status,
        Division,
        ManNonCon,
        Sequence,
        Unit,
        WorkOrder,
        ArchivedTicket,
        LaborDepartment,
        WorkOrderLaborDepartment,
        WorkOrderNonconformance,
        WorkOrderSequence,
        WorkOrderUnit,
        File,
        AuditLog,
        TicketClosure,
        Note
    ],
    
    synchronize: false, 
    logging: false,
    logger: "file" ,
    options: {
        encrypt: false, 
        trustServerCertificate: true, // Necessary for local SQL Server dev
    },
});


module.exports = { AppDataSource };
