const logger = require('./logger');

/**
 * Global error handler middleware for Express
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.url,
  };

  // Determine status code
  let statusCode = 500;
  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Create a custom error class
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} name - Error name
 */
class CustomError extends Error {
  constructor(message, statusCode = 500, name = 'CustomError') {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

/**
 * Validation error
 */
class ValidationError extends CustomError {
  constructor(message) {
    super(message, 400, 'ValidationError');
  }
}

/**
 * Authentication error
 */
class AuthenticationError extends CustomError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AuthenticationError');
  }
}

/**
 * Authorization error
 */
class AuthorizationError extends CustomError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AuthorizationError');
  }
}

/**
 * Not found error
 */
class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NotFoundError');
  }
}

module.exports = {
  errorHandler,
  CustomError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
