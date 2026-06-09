const Joi = require('joi');

const createAssetSchema = Joi.object({
  asset_code: Joi.string().min(3).max(50).required(),
  asset_name: Joi.string().max(200).required(),
  asset_type: Joi.string().max(100).required(),
  purchase_date: Joi.date().iso().allow(null, '').optional(),
  purchase_cost: Joi.number().positive().allow(null, 0).optional(),
  status: Joi.string().valid('Available', 'Allocated', 'Returned', 'Damaged', 'Lost').default('Available').optional()
});

const allocateAssetSchema = Joi.object({
  asset_id: Joi.number().integer().required(),
  employee_id: Joi.number().integer().required(),
  return_date: Joi.date().iso().allow(null, '').optional()
});

const updateAssetStatusSchema = Joi.object({
  status: Joi.string().valid('Available', 'Allocated', 'Returned', 'Damaged', 'Lost').required(),
  remarks: Joi.string().max(500).allow('', null).optional()
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

module.exports = { createAssetSchema, allocateAssetSchema, updateAssetStatusSchema, validate };
