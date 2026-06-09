const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const assetController = require('../controllers/assetController');
const { createAssetSchema, allocateAssetSchema, updateAssetStatusSchema, validate } = require('../validators/assetValidators');

// GET reports (hr & admin only) - put before parameterized /:id route so it doesn't conflict
router.get('/report', protect, authorize(['hr', 'admin']), assetController.getAssetReport);

// Core CRUD and searches
router.post('/', protect, authorize(['hr', 'admin']), validate(createAssetSchema), assetController.createAsset);
router.get('/', protect, assetController.getAllAssets);
router.get('/:id', protect, assetController.getAssetById);

// Allocation workflows
router.post('/allocate', protect, authorize(['manager', 'hr', 'admin']), validate(allocateAssetSchema), assetController.allocateAsset);
router.put('/return/:allocationId', protect, authorize(['manager', 'hr', 'admin']), assetController.returnAsset);
router.put('/status/:id', protect, authorize(['manager', 'hr', 'admin']), validate(updateAssetStatusSchema), assetController.updateStatus);

module.exports = router;
