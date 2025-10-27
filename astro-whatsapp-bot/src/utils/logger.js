const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'astro-whatsapp-bot' },
  transports: [
    // Only use console transport for now to avoid file path issues
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// For testing, override methods to use console directly
if (process.env.NODE_ENV === 'test') {
  logger.info = (...args) => console.log(...args);
  logger.error = (...args) => console.error(...args);
  logger.warn = (...args) => console.warn(...args);
  logger.debug = (...args) => console.log(...args);
}

module.exports = logger;
