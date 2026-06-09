const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  phone: Joi.string().max(20).required(),
  address: Joi.string().min(5).required(),
  designation: Joi.string().max(100).required(),
  salary: Joi.number().positive().precision(2).required(),
  department_id: Joi.number().integer().required(),
  skills: Joi.array().items(Joi.number().integer()).optional().default([])
});

const updateEmployeeSchema = Joi.object({
  phone: Joi.string().max(20).required(),
  address: Joi.string().min(5).required(),
  designation: Joi.string().max(100).required(),
  salary: Joi.number().positive().precision(2).required(),
  department_id: Joi.number().integer().required(),
  skills: Joi.array().items(Joi.number().integer()).optional().default([])
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

module.exports = { createEmployeeSchema, updateEmployeeSchema, validate };
