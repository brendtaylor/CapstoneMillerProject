const express = require('express');
const fs = require('fs').promises;
const app = express();
const sql = require('mssql');

// SQL Database connection config
// This is how I connect to our SQL server
const config = {
    user: 'user',
    password: 'password',
    server: 'server',
    database: 'database',
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};

// example
app.get('/quality-tickets', async (req, res) => {

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Query the database
        let result = await pool.request()
        .query("SELECT QUERY HERE...");

        // Send the result back to the client
        res.json(result.recordset);

        // Close the connection
        await pool.close();
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});