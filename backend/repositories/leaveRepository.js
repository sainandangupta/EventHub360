const pool = require('../config/db');

const leaveRepository = {
  // Get all leave types
  async getLeaveTypes() {
    const result = await pool.query('SELECT * FROM leave_types ORDER BY id');
    return result.rows;
  },

  // Get leave balance for an employee and year
  async getLeaveBalance(employeeId, year) {
    const result = await pool.query(
      `SELECT lb.id, lb.employee_id, lb.leave_type_id, lt.leave_name,
              lt.total_days, lb.available_days,
              (lt.total_days - lb.available_days) AS used_days, lb.year
       FROM leave_balance lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.employee_id = $1 AND lb.year = $2`,
      [employeeId, year]
    );
    return result.rows;
  },

  // Initialize leave balance for an employee and year
  async initializeBalance(employeeId, year) {
    await pool.query('SELECT sp_initialize_leave_balance($1, $2)', [employeeId, year]);
  },

  // Apply for leave using stored procedure
  async applyLeave(employeeId, leaveTypeId, fromDate, toDate, totalDays, reason) {
    const result = await pool.query(
      'SELECT * FROM sp_apply_leave($1, $2, $3, $4, $5, $6)',
      [employeeId, leaveTypeId, fromDate, toDate, totalDays, reason]
    );
    return result.rows[0];
  },

  // Get leave application by ID with full details
  async getLeaveById(id) {
    const result = await pool.query(
      `SELECT la.*, ep.user_id, u.name AS employee_name, u.email AS employee_email,
              d.department_name, lt.leave_name AS leave_type_name
       FROM leave_applications la
       JOIN employee_profiles ep ON la.employee_id = ep.id
       JOIN users u ON ep.user_id = u.id
       LEFT JOIN departments d ON ep.department_id = d.id
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Get leaves for an employee, optionally filtered by status
  async getMyLeaves(employeeId, status) {
    let query = `SELECT la.*, lt.leave_name AS leave_type_name
                 FROM leave_applications la
                 JOIN leave_types lt ON la.leave_type_id = lt.id
                 WHERE la.employee_id = $1`;
    const params = [employeeId];

    if (status) {
      query += ' AND la.status = $2';
      params.push(status);
    }

    query += ' ORDER BY la.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get pending leaves for a manager
  async getPendingForManager(managerId) {
    const result = await pool.query(
      `SELECT * FROM v_leave_summary
       WHERE manager_id = $1 AND status = 'pending'`,
      [managerId]
    );
    return result.rows;
  },

  // Get leaves pending HR approval (manager already approved)
  async getPendingForHR() {
    const result = await pool.query(
      `SELECT * FROM v_leave_summary
       WHERE status = 'manager_approved'`
    );
    return result.rows;
  },

  // Approve or reject leave using stored procedure
  async approveLeave(leaveId, approverId, role, action, remarks) {
    const result = await pool.query(
      'SELECT * FROM sp_approve_leave($1, $2, $3, $4, $5)',
      [leaveId, approverId, role, action, remarks || '']
    );
    return result.rows[0];
  },

  // Cancel a pending leave application
  async cancelLeave(leaveId, employeeId) {
    // Get user_id for audit log
    const empResult = await pool.query(
      'SELECT user_id FROM employee_profiles WHERE id = $1', [employeeId]
    );
    const userId = empResult.rows[0]?.user_id;

    const result = await pool.query(
      `UPDATE leave_applications
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND employee_id = $2 AND status = 'pending'
       RETURNING *`,
      [leaveId, employeeId]
    );

    if (result.rows.length > 0 && userId) {
      await pool.query(
        `INSERT INTO approval_history (leave_id, approved_by, role, action, remarks, created_at)
         VALUES ($1, $2, 'employee', 'cancelled', 'Cancelled by employee', NOW())`,
        [leaveId, userId]
      );
    }

    return result.rows[0];
  },

  // Get approval history for a leave application
  async getApprovalHistory(leaveId) {
    const result = await pool.query(
      `SELECT ah.*, u.name AS approver_name, u.email AS approver_email
       FROM approval_history ah
       LEFT JOIN users u ON ah.approved_by = u.id
       WHERE ah.leave_id = $1
       ORDER BY ah.created_at ASC`,
      [leaveId]
    );
    return result.rows;
  },

  // Get dashboard statistics
  async getDashboardStats() {
    const result = await pool.query(
      `SELECT
         COUNT(*)::int AS total,
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int AS pending,
         SUM(CASE WHEN status = 'manager_approved' THEN 1 ELSE 0 END)::int AS manager_approved,
         SUM(CASE WHEN status = 'hr_approved' THEN 1 ELSE 0 END)::int AS approved,
         SUM(CASE WHEN status IN ('manager_rejected', 'hr_rejected') THEN 1 ELSE 0 END)::int AS rejected,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)::int AS cancelled
       FROM leave_applications`
    );
    return result.rows[0];
  },

  // Employee-wise leave report
  async getEmployeeWiseReport(year) {
    const result = await pool.query(
      `SELECT employee_name, employee_email, department_name,
              COUNT(*)::int AS total_applications,
              SUM(total_days)::int AS total_days,
              SUM(CASE WHEN status = 'hr_approved' THEN 1 ELSE 0 END)::int AS approved,
              SUM(CASE WHEN status IN ('manager_rejected', 'hr_rejected') THEN 1 ELSE 0 END)::int AS rejected
       FROM v_leave_summary
       WHERE EXTRACT(YEAR FROM from_date) = $1
       GROUP BY employee_name, employee_email, department_name
       ORDER BY total_days DESC`,
      [year]
    );
    return result.rows;
  },

  // Department-wise leave report
  async getDepartmentWiseReport(year) {
    const result = await pool.query(
      'SELECT * FROM v_department_leave_stats'
    );
    return result.rows;
  },

  // Monthly trend report
  async getMonthlyTrendReport(year) {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const result = await pool.query(
      `SELECT
         EXTRACT(MONTH FROM from_date)::int AS month_num,
         COUNT(*)::int AS total_applications,
         SUM(CASE WHEN status = 'hr_approved' THEN 1 ELSE 0 END)::int AS approved,
         SUM(CASE WHEN status IN ('manager_rejected', 'hr_rejected') THEN 1 ELSE 0 END)::int AS rejected
       FROM leave_applications
       WHERE EXTRACT(YEAR FROM from_date) = $1
       GROUP BY EXTRACT(MONTH FROM from_date)
       ORDER BY month_num`,
      [year]
    );
    return result.rows.map(r => ({ ...r, month_name: months[r.month_num] || `Month ${r.month_num}` }));
  },

  // Most absent employees (subquery: above-average absences)
  async getMostAbsentEmployees(year, limit = 10) {
    const result = await pool.query(
      `SELECT employee_name, department_name, total_days_taken,
              RANK() OVER (ORDER BY total_days_taken DESC) AS rank
       FROM (
         SELECT employee_name, department_name,
                SUM(total_days)::int AS total_days_taken
         FROM v_leave_summary
         WHERE EXTRACT(YEAR FROM from_date) = $1
           AND status = 'hr_approved'
         GROUP BY employee_name, department_name
       ) sub
       ORDER BY total_days_taken DESC
       LIMIT $2`,
      [year, limit]
    );
    return result.rows;
  },

  // Leave balance report
  async getLeaveBalanceReport(year) {
    const result = await pool.query(
      'SELECT * FROM v_employee_leave_balance WHERE year = $1',
      [year]
    );
    return result.rows;
  },

  // Leave rankings using window functions (ROW_NUMBER, RANK, DENSE_RANK)
  async getLeaveRankings(year) {
    const result = await pool.query(
      `SELECT employee_name, department_name, total_days_taken,
              ROW_NUMBER() OVER (ORDER BY total_days_taken DESC) AS row_num,
              RANK() OVER (ORDER BY total_days_taken DESC) AS rank,
              DENSE_RANK() OVER (ORDER BY total_days_taken DESC) AS dense_rank
       FROM (
         SELECT employee_name, department_name,
                SUM(total_days)::int AS total_days_taken
         FROM v_leave_summary
         WHERE EXTRACT(YEAR FROM from_date) = $1
           AND status = 'hr_approved'
         GROUP BY employee_name, department_name
       ) sub
       ORDER BY total_days_taken DESC`,
      [year]
    );
    return result.rows;
  }
};

module.exports = leaveRepository;
