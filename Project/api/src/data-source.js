const { DataSource } = require("typeorm");

// Import all entity schemas
const Ticket = require("./entities/ticket.entity");
const User = require("./entities/user.entity");
const Status = require("./entities/status.entity");
const Division = require("./entities/division.entity");
const DrawingNum = require("./entities/drawing.entity");
const ManNonCon = require("./entities/manufact_noncon.entity");
const PartNum = require("./entities/part.entity");
const Sequence = require("./entities/sequence.entity");
const Unit = require("./entities/unit.entity");
const WorkOrder = require("./entities/wo.entity");
const ArchivedTicket = require("./entities/archived-ticket.entity");


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
        DrawingNum,
        ManNonCon,
        PartNum,
        Sequence,
        Unit,
        WorkOrder,
        ArchivedTicket
    ],
    
    synchronize: false, 
    logging: true, 
    options: {
        encrypt: false, 
        trustServerCertificate: true, // Necessary for local SQL Server dev
    },
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });

module.exports = { AppDataSource };

