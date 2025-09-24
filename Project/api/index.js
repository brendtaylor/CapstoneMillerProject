//Description: This file is the bridge between the application and the database. It also provides access to the entity files

// load environment variables
require('dotenv').config();

const express = require("express");
const { AppDataSource } = require("./src/data-source");
const ticketRoutes = require("./src/routes/ticket.routes.js");

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        // Create a new Express application instance
        const app = express();
        const port = process.env.PORT || 3000;

        // Add middleware to parse incoming JSON requests
        app.use(express.json());

        // --- API routes will go here ---
        app.use("/api/tickets", ticketRoutes);

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error during Data Source initialization:", error);
    });