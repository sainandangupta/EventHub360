const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
    stack: err.stack,
    statusCode,
    userId: req.user?.id,
    errors: err.errors
  });

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = { errorHandler, notFoundHandler };
