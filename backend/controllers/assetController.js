const assetService = require('../services/assetService');

const assetController = {
  // Create an asset
  async createAsset(req, res, next) {
    try {
      const asset = await assetService.createAsset(req.body, req.user.id);
      res.status(201).json({
        message: 'Asset created successfully',
        data: asset
      });
    } catch (err) {
      next(err);
    }
  },

  // Get assets (supports pagination, filtering, search, sorting)
  async getAllAssets(req, res, next) {
    try {
      const search = req.query.search || '';
      const status = req.query.status || '';
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;
      const sortField = req.query.sortField || 'id';
      const sortOrder = req.query.sortOrder || 'DESC';

      const result = await assetService.getAllAssets({
        search,
        status,
        limit,
        offset,
        sortField,
        sortOrder
      });

      res.json({
        data: result.assets,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err) {
      next(err);
    }
  },

  // Get asset by ID (with history and allocation)
  async getAssetById(req, res, next) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: 'Asset not found' });
      }
      res.json(asset);
    } catch (err) {
      next(err);
    }
  },

  // Allocate an asset to an employee
  async allocateAsset(req, res, next) {
    try {
      const { asset_id, employee_id, return_date } = req.body;
      const result = await assetService.allocateAsset(
        asset_id,
        employee_id,
        req.user.id,
        return_date
      );
      res.json({
        message: 'Asset allocated successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  // Return an asset
  async returnAsset(req, res, next) {
    try {
      const { allocationId } = req.params;
      const { remarks } = req.body;
      const result = await assetService.returnAsset(allocationId, req.user.id, remarks);
      res.json({
        message: 'Asset returned successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  // Update status manually
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const result = await assetService.updateAssetStatus(id, status, remarks, req.user.id);
      res.json({
        message: `Asset status updated to ${status} successfully`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  // Get assets report exports
  async getAssetReport(req, res, next) {
    try {
      const data = await assetService.getAssetReport();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = assetController;
