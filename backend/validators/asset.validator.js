const Joi = require('joi');

const createAssetSchema = Joi.object({
  asset_code: Joi.string().min(3).max(50).required(),
  asset_name: Joi.string().max(200).required(),
  asset_type: Joi.string().max(100).required(),
  purchase_date: Joi.date().iso().allow(null, '').optional(),
  purchase_cost: Joi.number().positive().allow(null, 0).optional(),
  status: Joi.string()
    .valid('Available', 'Allocated', 'Returned', 'Damaged', 'Lost')
    .default('Available')
    .optional()
});

const allocateAssetSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  employee_id: Joi.number().integer().positive().required(),
  return_date: Joi.date().iso().allow(null, '').optional()
});

const updateAssetStatusSchema = Joi.object({
  status: Joi.string().valid('Available', 'Allocated', 'Returned', 'Damaged', 'Lost').required(),
  remarks: Joi.string().max(500).allow('', null).optional()
});

const assetQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(20),
  search: Joi.string().max(100).allow('').optional(),
  status: Joi.string().valid('Available', 'Allocated', 'Returned', 'Damaged', 'Lost').optional(),
  sortField: Joi.string().valid('id', 'asset_code', 'asset_name', 'purchase_cost', 'status').default('id'),
  sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

module.exports = {
  createAssetSchema,
  allocateAssetSchema,
  updateAssetStatusSchema,
  assetQuerySchema
};
