const Joi = require('joi');

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?[\d\s()-]{7,20}$/;

const createEmployeeSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Phone must be a valid phone number (7-20 digits)'
  }),
  address: Joi.string().min(5).max(500).required(),
  designation: Joi.string().max(100).required(),
  salary: Joi.number().positive().precision(2).max(99999999).required(),
  department_id: Joi.number().integer().positive().required(),
  skills: Joi.array().items(Joi.number().integer().positive()).optional().default([])
});

const updateEmployeeSchema = createEmployeeSchema;

const employeeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).allow('').optional(),
  department_id: Joi.number().integer().positive().optional(),
  sortBy: Joi.string().valid('salary', 'name', 'created_at', 'designation').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc')
});

module.exports = { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema };
