const pool = require('../config/db');

const assetRepository = {
  // Create an asset
  async createAsset(asset_code, asset_name, asset_type, purchase_date, purchase_cost, status = 'Available') {
    const result = await pool.query(
      `INSERT INTO assets (asset_code, asset_name, asset_type, purchase_date, purchase_cost, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [asset_code, asset_name, asset_type, purchase_date || null, purchase_cost || null, status]
    );
    return result.rows[0];
  },

  // Get asset by ID
  async getAssetById(id) {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    return result.rows[0];
  },

  // Get asset by unique code
  async getAssetByCode(asset_code) {
    const result = await pool.query('SELECT * FROM assets WHERE asset_code = $1', [asset_code]);
    return result.rows[0];
  },

  // Get list of assets with search, sorting, filtering, and pagination
  async getAllAssets({ search, status, limit = 10, offset = 0, sortField = 'id', sortOrder = 'DESC' }) {
    let query = `
      SELECT a.*, 
             al.employee_id,
             u.name AS current_employee_name
      FROM assets a
      LEFT JOIN asset_allocations al ON a.id = al.asset_id AND al.status = 'Allocated'
      LEFT JOIN employee_profiles ep ON al.employee_id = ep.id
      LEFT JOIN users u ON ep.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (a.asset_code ILIKE $${paramIndex} OR a.asset_name ILIKE $${paramIndex} OR a.asset_type ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filter
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Sorting safety check
    const allowedSortFields = ['id', 'asset_code', 'asset_name', 'asset_type', 'purchase_date', 'purchase_cost', 'status'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'id';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Total count query before limits
    let countQuery = `SELECT COUNT(*) FROM assets a WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;
    if (search) {
      countQuery += ` AND (a.asset_code ILIKE $${countParamIndex} OR a.asset_name ILIKE $${countParamIndex} OR a.asset_type ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    if (status) {
      countQuery += ` AND a.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Apply sorting and pagination
    query += ` ORDER BY a.${safeSortField} ${safeSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      assets: result.rows,
      total: totalCount,
      limit,
      offset
    };
  },

  // Update asset status
  async updateAssetStatus(id, status) {
    const result = await pool.query(
      'UPDATE assets SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  // Create allocation
  async createAllocation(assetId, employeeId, allocatedBy, returnDate = null) {
    const result = await pool.query(
      `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, allocated_date, return_date, status)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, 'Allocated')
       RETURNING *`,
      [assetId, employeeId, allocatedBy, returnDate || null]
    );
    return result.rows[0];
  },

  // Return allocation (close status)
  async updateAllocationReturn(allocationId, returnDate = CURRENT_DATE, status = 'Returned') {
    const result = await pool.query(
      `UPDATE asset_allocations 
       SET return_date = $1, status = $2 
       WHERE id = $3 
       RETURNING *`,
      [returnDate, status, allocationId]
    );
    return result.rows[0];
  },

  // Get active allocation by Asset ID
  async getActiveAllocationByAssetId(assetId) {
    const result = await pool.query(
      `SELECT * FROM asset_allocations WHERE asset_id = $1 AND status = 'Allocated'`,
      [assetId]
    );
    return result.rows[0];
  },

  // Get allocation by ID
  async getAllocationById(id) {
    const result = await pool.query(
      `SELECT al.*, u.name AS employee_name, u.email AS employee_email
       FROM asset_allocations al
       JOIN employee_profiles ep ON al.employee_id = ep.id
       JOIN users u ON ep.user_id = u.id
       WHERE al.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get allocations for an employee
  async getAllocationsByEmployeeId(employeeId) {
    const result = await pool.query(
      `SELECT al.*, a.asset_code, a.asset_name, a.asset_type
       FROM asset_allocations al
       JOIN assets a ON al.asset_id = a.id
       WHERE al.employee_id = $1
       ORDER BY al.id DESC`,
      [employeeId]
    );
    return result.rows;
  },

  // Create asset history entry
  async createHistoryEntry(assetId, action, remarks, createdBy) {
    const result = await pool.query(
      `INSERT INTO asset_history (asset_id, action, remarks, created_by, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [assetId, action, remarks, createdBy]
    );
    return result.rows[0];
  },

  // Get asset history
  async getHistoryByAssetId(assetId) {
    const result = await pool.query(
      `SELECT ah.*, u.name AS performed_by_name
       FROM asset_history ah
       LEFT JOIN users u ON ah.created_by = u.id
       WHERE ah.asset_id = $1
       ORDER BY ah.created_at DESC`,
      [assetId]
    );
    return result.rows;
  },

  // Report: get all assets including allocation history for reporting exports
  async getAssetReportData() {
    const result = await pool.query(`
      SELECT a.id, a.asset_code, a.asset_name, a.asset_type, a.purchase_date, a.purchase_cost, a.status,
             u.name AS current_user_name,
             d.department_name
      FROM assets a
      LEFT JOIN asset_allocations al ON a.id = al.asset_id AND al.status = 'Allocated'
      LEFT JOIN employee_profiles ep ON al.employee_id = ep.id
      LEFT JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      ORDER BY a.id ASC
    `);
    return result.rows;
  }
};

module.exports = assetRepository;
