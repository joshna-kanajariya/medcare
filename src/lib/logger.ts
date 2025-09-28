import winston from 'winston'

const logLevel = process.env.LOG_LEVEL || 'info'

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Create logger instance
export const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'medcare-api' },
  transports: [
    // Write all logs with importance level of 'error' or higher to 'error.log'
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to 'combined.log'
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }))
}

// Helper functions for structured logging
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  logger.info(message, meta)
}

export const logError = (message: string, error?: Error | Record<string, unknown>) => {
  logger.error(message, { 
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    ...(error && typeof error === 'object' ? error : {})
  })
}

export const logWarning = (message: string, meta?: Record<string, unknown>) => {
  logger.warn(message, meta)
}

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
  logger.debug(message, meta)
}