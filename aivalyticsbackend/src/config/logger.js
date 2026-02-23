const winston = require("winston");
const path = require("path");

/**
 * Enterprise-grade logging configuration
 * Supports multiple transports and log levels
 */

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create transports array
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: process.env.LOG_LEVEL || "info",
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === "production") {
  // Ensure logs directory exists
  const logsDir = path.join(__dirname, "../../logs");

  transports.push(
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels: logLevels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.Console({
    format: logFormat,
  }),
);

logger.rejections.handle(
  new winston.transports.Console({
    format: logFormat,
  }),
);

/**
 * Custom logging methods for different scenarios
 */
logger.logRequest = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms - ${req.ip}`;

  if (res.statusCode >= 400) {
    logger.warn(message);
  } else {
    logger.http(message);
  }
};

logger.logError = (error, req = null) => {
  let message = `Error: ${error.message}`;

  if (req) {
    message += ` | Route: ${req.method} ${req.originalUrl} | IP: ${req.ip}`;
  }

  if (error.stack) {
    message += ` | Stack: ${error.stack}`;
  }

  logger.error(message);
};

logger.logAuth = (action, userId, success, details = "") => {
  const status = success ? "SUCCESS" : "FAILED";
  const message = `AUTH ${status}: ${action} | User: ${
    userId || "unknown"
  } | ${details}`;

  if (success) {
    logger.info(message);
  } else {
    logger.warn(message);
  }
};

module.exports = logger;
