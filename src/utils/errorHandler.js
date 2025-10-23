const logger = require('./logger');

/**
 * Global error handler middleware
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled application error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Determine response based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, don't send stack trace
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } else {
    // In development, send detailed error
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Validation error handler
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 */
const ValidationError = class extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Not found error handler
 */
const NotFoundError = class extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.statusCode = 404;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Authentication error handler
 */
const AuthenticationError = class extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.statusCode = 401;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

/**
 * Authorization error handler
 */
const AuthorizationError = class extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.statusCode = 403;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

module.exports = {
  errorHandler,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError
};