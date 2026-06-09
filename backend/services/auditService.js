const auditRepository = require('../repositories/auditRepository');

const auditService = {
  // Get system audit records
  async getAuditLogs(filters) {
    return auditRepository.getAuditLogs(filters);
  }
};

module.exports = auditService;
