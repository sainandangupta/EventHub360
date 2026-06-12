const pool = require('../config/db');

const attendanceRepository = {
  async checkIn(employeeId) {
    const result = await pool.query(
      `INSERT INTO attendance_records (employee_id, date, check_in, status)
       VALUES ($1, CURRENT_DATE, NOW(), 'present')
       ON CONFLICT (employee_id, date) DO UPDATE SET check_in = NOW(), status = 'present'
       RETURNING *`,
      [employeeId]
    );
    return result.rows[0];
  },

  async checkOut(employeeId) {
    const result = await pool.query(
      `UPDATE attendance_records 
       SET check_out = NOW(), 
           work_hours = ROUND(EXTRACT(EPOCH FROM (NOW() - check_in)) / 3600.0, 2)
       WHERE employee_id = $1 AND date = CURRENT_DATE AND check_in IS NOT NULL
       RETURNING *`,
      [employeeId]
    );
    return result.rows[0];
  },

  async getTodayStatus(employeeId) {
    const result = await pool.query(
      `SELECT * FROM attendance_records WHERE employee_id = $1 AND date = CURRENT_DATE`,
      [employeeId]
    );
    return result.rows[0] || null;
  },

  async getMonthlyAttendance(employeeId, month, year) {
    const result = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE employee_id = $1 
       AND EXTRACT(MONTH FROM date) = $2 
       AND EXTRACT(YEAR FROM date) = $3
       ORDER BY date ASC`,
      [employeeId, month, year]
    );
    return result.rows;
  },

  async getAttendanceStats(employeeId, month, year) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'present')::int AS present_days,
        COUNT(*) FILTER (WHERE status = 'absent')::int AS absent_days,
        COUNT(*) FILTER (WHERE status = 'half_day')::int AS half_days,
        COUNT(*) FILTER (WHERE status = 'late')::int AS late_days,
        COUNT(*)::int AS total_records,
        COALESCE(ROUND(AVG(work_hours), 2), 0) AS avg_work_hours
       FROM attendance_records
       WHERE employee_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3`,
      [employeeId, month, year]
    );
    return result.rows[0];
  },

  async getOverallStats(employeeId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'present')::int AS present_days,
        COUNT(*) FILTER (WHERE status = 'absent')::int AS absent_days,
        COUNT(*)::int AS total_records,
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(COUNT(*) FILTER (WHERE status = 'present')::NUMERIC / COUNT(*)::NUMERIC * 100, 1)
          ELSE 0 END AS attendance_percentage,
        COALESCE(ROUND(AVG(work_hours), 2), 0) AS avg_work_hours
       FROM attendance_records
       WHERE employee_id = $1`,
      [employeeId]
    );
    return result.rows[0];
  },

  async getDailyAttendance(date) {
    const result = await pool.query(
      `SELECT ar.*, u.name AS employee_name, d.department_name
       FROM attendance_records ar
       INNER JOIN employee_profiles ep ON ar.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE ar.date = $1
       ORDER BY u.name`,
      [date]
    );
    return result.rows;
  },

  async getTodaySummary() {
    const result = await pool.query(
      `SELECT 
        (SELECT COUNT(*)::int FROM employee_profiles WHERE status = 'active') AS total_employees,
        COUNT(*) FILTER (WHERE ar.status = 'present')::int AS present_today,
        COUNT(*) FILTER (WHERE ar.status = 'absent')::int AS absent_today,
        COUNT(*) FILTER (WHERE ar.status = 'late')::int AS late_today
       FROM employee_profiles ep
       LEFT JOIN attendance_records ar ON ep.id = ar.employee_id AND ar.date = CURRENT_DATE
       WHERE ep.status = 'active'`
    );
    return result.rows[0];
  },

  async getAttendanceHistory(employeeId, limit = 30) {
    const result = await pool.query(
      `SELECT * FROM attendance_records 
       WHERE employee_id = $1 
       ORDER BY date DESC
       LIMIT $2`,
      [employeeId, limit]
    );
    return result.rows;
  }
};

module.exports = attendanceRepository;
