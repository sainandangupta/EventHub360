const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with Winston
  logger.error(`${req.method} ${req.originalUrl} - Status: ${statusCode} - Error: ${message}`, {
    stack: err.stack,
    statusCode,
    userId: req.user?.id
  });

  res.status(statusCode).json({
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
