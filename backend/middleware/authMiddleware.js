const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return next(AppError.unauthorized('Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    next(AppError.unauthorized('Invalid or expired token'));
  }
};
