const pool = require('../config/db');
const logger = require('./logger');

const auditLogger = {
  /**
   * Insert a log record into the audit_logs table
   * @param {string} tableName Name of the modified table
   * @param {string} actionType Action type (INSERT, UPDATE, DELETE)
   * @param {number} recordId Target row primary key ID
   * @param {object|null} oldData Previous row data (JSONB)
   * @param {object|null} newData Updated row data (JSONB)
   * @param {number|null} performedBy User ID who performed the action
   */
  async log(tableName, actionType, recordId, oldData, newData, performedBy) {
    try {
      // Stringify payload to ensure correct JSON formatting
      const oldJSON = oldData ? JSON.stringify(oldData) : null;
      const newJSON = newData ? JSON.stringify(newData) : null;

      await pool.query(
        `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tableName, actionType.toUpperCase(), recordId, oldJSON, newJSON, performedBy]
      );
      
      logger.info(`Audit Log Created: ${actionType} on table '${tableName}', record ID ${recordId}`);
    } catch (err) {
      // Don't throw errors so the main request flow is not broken, but log it via Winston
      logger.error(`Failed to write audit log for ${tableName} ID ${recordId}`, { error: err.message });
    }
  }
};

module.exports = auditLogger;
