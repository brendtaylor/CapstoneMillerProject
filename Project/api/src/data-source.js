//The key to the pantry

require('dotenv').config();

const { DataSource } = require("typeorm");


const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
    },
    synchronize: false, //used to auto-update DB schema with ORM code
    logging: process.env.NODE_ENV === 'development',
    entities: ["src/entities/**/*.js"],
});

module.exports = { AppDataSource };

