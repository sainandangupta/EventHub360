const pool = require('../config/db');

const auditRepository = {
  // Get audit logs with details and pagination
  async getAuditLogs({ tableName, actionType, limit = 50, offset = 0 }) {
    let query = `
      SELECT al.*, 
             u.name AS performed_by_name, 
             u.email AS performed_by_email
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Optional Table Name Filter
    if (tableName) {
      query += ` AND al.table_name = $${paramIndex}`;
      params.push(tableName);
      paramIndex++;
    }

    // Optional Action Type Filter
    if (actionType) {
      query += ` AND al.action_type = $${paramIndex}`;
      params.push(actionType.toUpperCase());
      paramIndex++;
    }

    // Total Count
    let countQuery = `SELECT COUNT(*) FROM audit_logs al WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;
    if (tableName) {
      countQuery += ` AND al.table_name = $${countParamIndex}`;
      countParams.push(tableName);
      countParamIndex++;
    }
    if (actionType) {
      countQuery += ` AND al.action_type = $${countParamIndex}`;
      countParams.push(actionType.toUpperCase());
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count || 0);

    // Order & Pagination
    query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      logs: result.rows,
      total: totalCount,
      limit,
      offset
    };
  }
};

module.exports = auditRepository;
