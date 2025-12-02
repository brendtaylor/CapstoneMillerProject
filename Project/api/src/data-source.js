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
const Image = require("./entities/image.entity");
const AuditLog = require("./entities/audit-log.entity.js");

const AppDataSource = new DataSource({
    type: "mssql",
    //read .env file
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    
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
        Image,
        AuditLog
    ],
    
    synchronize: false, 
    logging: true,
    logger: "file" ,
    options: {
        encrypt: false, 
        trustServerCertificate: true, // Necessary for local SQL Server dev
    },
});


module.exports = { AppDataSource };

