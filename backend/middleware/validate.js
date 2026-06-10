const AppError = require('../utils/AppError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return next(AppError.validation('Validation failed', errors));
    }
    if (source === 'body') req.body = value;
    else if (source === 'query') req.query = value;
    next();
  };
};

module.exports = validate;
