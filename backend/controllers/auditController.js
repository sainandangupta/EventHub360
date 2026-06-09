const auditService = require('../services/auditService');

const auditController = {
  // Get audit records for administration panel
  async getAuditLogs(req, res, next) {
    try {
      const tableName = req.query.tableName || '';
      const actionType = req.query.actionType || '';
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      const result = await auditService.getAuditLogs({
        tableName,
        actionType,
        limit,
        offset
      });

      res.json({
        data: result.logs,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = auditController;
