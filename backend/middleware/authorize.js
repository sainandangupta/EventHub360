const AppError = require('../utils/AppError');

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Unauthorized: No user data'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Forbidden: Only ${allowedRoles.join(', ')} can access this resource`));
    }
    next();
  };
};

module.exports = authorize;
