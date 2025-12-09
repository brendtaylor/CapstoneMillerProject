/**
 * @file index.js
 * Application Entry Point.
 * 
 * Responsibilities:
 * 1. Initializes the Database Connection via TypeORM.
 * 2. Configures the Express Server (CORS, JSON parsing).
 * 3. Mounts API routes (Main API & Audit logs).
 * 4. Starts the HTTP server on the defined port.
 */
require('dotenv').config(); 
const express = require("express");
const cors = require('cors');

const mainApiRouter = require("./src/routes/index.js");
const auditRouter = require("./src/routes/audit.js");
const { AppDataSource } = require("./src/data-source");

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        const app = express();
        const port = process.env.PORT || 3000;

        app.use(express.json());
        
        /**
         * CORS Configuration
         * Allow requests from:
         * - Local Development (React default ports)
         * - Hoppscotch (API testing tool)
         */
        app.use(cors({
            origin: ['http://localhost:5173', 'http://localhost:4001', 'https://hoppscotch.io', 'https://web.hoppscotch.io'],
            methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'], 
            allowedHeaders: ['Content-Type','Authorization', 'cache-control', 'pragma']
        }));

        // Route Mounting
        app.use("/api/audit", auditRouter);
        app.use('/api', mainApiRouter);

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });
