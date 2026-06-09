const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leave_type_id: Joi.number().integer().required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().min(Joi.ref('from_date')).required(),
  total_days: Joi.number().integer().min(1).required(),
  reason: Joi.string().max(500).required()
});

const approveLeaveSchema = Joi.object({
  action: Joi.string().valid('manager_approved', 'manager_rejected', 'hr_approved', 'hr_rejected').required(),
  remarks: Joi.string().max(500).allow('').optional()
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(d => d.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
  };
};

module.exports = { applyLeaveSchema, approveLeaveSchema, validate };
