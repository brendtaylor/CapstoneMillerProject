/**
 * @file logger.js
 * Application-wide logging configuration using Winston.
 * 
 *  - File Logging: - `error.log`: Captures all error-level events.
 *  - `combined.log`: Captures all events (info, warn, error).
 *  - Console Logging: Enabled only in non-production environments for developer visibility.
 *  - Formatting: Includes timestamps, stack traces for errors, and JSON formatting.
 */

const winston = require('winston');


/**
 * The main logger instance configured for the application.
 * * Configuration:
 * - **Level:** Defaults to 'info' (logs info, warn, and error).
 * - Adds `{ service: 'quality-ticket-api' }` to every log.
 */
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'quality-ticket-api' },
    transports: [
        //
        // - Write all logs with importance level 'error' to `error.log`
        // - Write all logs with importance level 'info', 'warn', and 'error' to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

//
// If not in production then log to the `console` with the
// format: `${info.level}: ${info.message} ${JSON.stringify(rest)} `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

module.exports = logger; 
