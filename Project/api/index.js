// Project/api/index.js (CLEANED VERSION)

//Description: This file is the bridge between the application and the database. It also provides access to the entity files

// load environment variables
require('dotenv').config(); // No path import needed, let Docker handle it
const express = require("express");
const cors = require('cors');

const mainApiRouter = require("./src/routes/index.js");

const auditRouter = require("./src/routes/audit.js");

const { AppDataSource } = require("./src/data-source");


// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Create a new Express application instance
        const app = express();
        const port = process.env.PORT || 3000;

        // Middleware to parse incoming JSON requests
        app.use(express.json());
        app.use(cors({
            origin: ['http://localhost:5173', 'http://localhost:4001', 'https://hoppscotch.io', 'https://web.hoppscotch.io'],
            methods: ['GET','POST','PUT','DELETE','OPTIONS'],
            allowedHeaders: ['Content-Type','Authorization', 'cache-control', 'pragma']
        }));

        // Mount the audit routes under /api
        app.use("/api", auditRouter);

        // main router
        app.use('/api', mainApiRouter);

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });