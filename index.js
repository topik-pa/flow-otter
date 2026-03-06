/**
 * Main entry point for the application server.
 * Configures environment variables, initializes the logger, and starts the Express server.
 * 
 * @module index
 * @requires dotenv/config - Loads environment variables from .env file
 * @requires ./app/configs/logger - Application logger instance
 * @requires ./server - Express application instance
 * 
 * @constant {number} PORT - Server port from environment variable or default 8080
 * 
 * @listens app#error - Handles server startup errors by logging and exiting process
 * 
 * @example
 * // Start the server
 * node index.js
 * 
 * @description
 * The server will:
 * - Start on the specified PORT (from environment or 8080)
 * - Log successful startup with mode information
 * - Handle errors by logging and exiting with code 1
 */

import 'dotenv/config'
import logger from './app/configs/logger.js'
import { app } from './server.js'

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`)
}).on('error', (err) => {
  logger.error('❌ Server failed to start ', err)
  process.exit(1)
})