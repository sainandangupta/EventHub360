const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  leave_type_id: Joi.number().integer().positive().required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().min(Joi.ref('from_date')).required(),
  total_days: Joi.number().integer().min(1).max(365).required(),
  reason: Joi.string().min(3).max(500).required()
});

const approveLeaveSchema = Joi.object({
  action: Joi.string()
    .valid('manager_approved', 'manager_rejected', 'hr_approved', 'hr_rejected')
    .required(),
  remarks: Joi.string().max(500).allow('').optional()
});

const leaveQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(20),
  search: Joi.string().max(100).allow('').optional(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'cancelled').optional(),
  sortBy: Joi.string().valid('from_date', 'created_at', 'status', 'total_days').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc')
});

module.exports = { applyLeaveSchema, approveLeaveSchema, leaveQuerySchema };
