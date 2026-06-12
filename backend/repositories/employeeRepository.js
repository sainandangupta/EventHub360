const pool = require('../config/db');

const employeeRepository = {
  // Create profile
  async createEmployee(userId, departmentId, phone, address, designation, salary, city, workMode, status, joiningDate) {
    const result = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary, city, work_mode, status, joining_date)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE(NULLIF($10, '')::DATE, CURRENT_DATE))
       RETURNING *`,
      [userId, departmentId, phone, address, designation, salary, city || null, workMode || 'offline', status || 'active', joiningDate || null]
    );
    return result.rows[0];
  },

  // Add skills
  async addEmployeeSkills(employeeId, skillIds) {
    if (!skillIds || skillIds.length === 0) return;
    for (let skillId of skillIds) {
      await pool.query(
        'INSERT INTO employee_skills(employee_id, skill_id) VALUES($1, $2)',
        [employeeId, skillId]
      );
    }
  },

  // Delete skills
  async deleteEmployeeSkills(employeeId) {
    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [employeeId]);
  },

  // Get all profiles with pagination, search, filter, sort
  async getAllEmployees({ search, department_id, city, work_mode, status, limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' } = {}) {
    let query = `
      SELECT 
        ep.id,
        u.name,
        u.email,
        d.department_name,
        ep.department_id,
        ep.designation,
        ep.salary,
        ep.phone,
        ep.created_at,
        ep.city,
        ep.work_mode,
        ep.status,
        ep.joining_date,
        COALESCE((
          SELECT ROUND(COUNT(*) FILTER (WHERE status IN ('present', 'late', 'half_day'))::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC * 100, 1)
          FROM attendance_records
          WHERE employee_id = ep.id
        ), 100.0) AS attendance_percentage
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR ep.designation ILIKE $${idx} OR ep.phone ILIKE $${idx} OR ep.city ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (department_id) {
      query += ` AND ep.department_id = $${idx}`;
      params.push(department_id);
      idx++;
    }
    if (city) {
      query += ` AND ep.city = $${idx}`;
      params.push(city);
      idx++;
    }
    if (work_mode) {
      query += ` AND ep.work_mode = $${idx}`;
      params.push(work_mode);
      idx++;
    }
    if (status) {
      query += ` AND ep.status = $${idx}`;
      params.push(status);
      idx++;
    }

    const sortMap = { 
      salary: 'ep.salary', 
      name: 'u.name', 
      created_at: 'ep.created_at', 
      designation: 'ep.designation',
      joining_date: 'ep.joining_date',
      city: 'ep.city',
      work_mode: 'ep.work_mode',
      status: 'ep.status'
    };
    const safeSort = sortMap[sortBy] || 'ep.created_at';
    const safeOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    let countQuery = `SELECT COUNT(*) FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id WHERE 1=1`;
    const countParams = [];
    let cIdx = 1;
    if (search) {
      countQuery += ` AND (u.name ILIKE $${cIdx} OR u.email ILIKE $${cIdx} OR ep.designation ILIKE $${cIdx} OR ep.phone ILIKE $${cIdx} OR ep.city ILIKE $${cIdx})`;
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (department_id) {
      countQuery += ` AND ep.department_id = $${cIdx}`;
      countParams.push(department_id);
      cIdx++;
    }
    if (city) {
      countQuery += ` AND ep.city = $${cIdx}`;
      countParams.push(city);
      cIdx++;
    }
    if (work_mode) {
      countQuery += ` AND ep.work_mode = $${cIdx}`;
      countParams.push(work_mode);
      cIdx++;
    }
    if (status) {
      countQuery += ` AND ep.status = $${cIdx}`;
      countParams.push(status);
      cIdx++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return { rows: result.rows, total };
  },

  // Get profile by ID
  async getEmployeeById(id) {
    const result = await pool.query(`
      SELECT 
        ep.*,
        u.name,
        u.email,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Get employee profile by user ID
  async getEmployeeByUserId(userId) {
    const result = await pool.query(`
      SELECT * FROM employee_profiles WHERE user_id = $1
    `, [userId]);
    return result.rows[0];
  },

  // Get skills
  async getEmployeeSkills(employeeId) {
    const result = await pool.query(`
      SELECT s.id, s.skill_name
      FROM employee_skills es
      INNER JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [employeeId]);
    return result.rows;
  },

  // Get images
  async getEmployeeImages(employeeId) {
    const result = await pool.query(`
      SELECT * FROM employee_images WHERE employee_id = $1
    `, [employeeId]);
    return result.rows;
  },

  // Update profile
  async updateEmployee(id, departmentId, phone, address, designation, salary, city, workMode, status, joiningDate) {
    const result = await pool.query(
      `UPDATE employee_profiles 
       SET department_id = $1, phone = $2, address = $3, designation = $4, salary = $5,
           city = $6, work_mode = $7, status = $8, joining_date = COALESCE(NULLIF($9, '')::DATE, joining_date)
       WHERE id = $10
       RETURNING *`,
      [departmentId, phone, address, designation, salary, city || null, workMode || 'offline', status || 'active', joiningDate || null, id]
    );
    return result.rows[0];
  },

  // Delete profile
  async deleteEmployee(id) {
    const result = await pool.query('DELETE FROM employee_profiles WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Delete images
  async deleteEmployeeImages(employeeId) {
    await pool.query('DELETE FROM employee_images WHERE employee_id = $1', [employeeId]);
  },

  // Save image
  async uploadEmployeeImage(employeeId, imageUrl) {
    const result = await pool.query(
      'INSERT INTO employee_images(employee_id, image_url) VALUES($1, $2) RETURNING *',
      [employeeId, imageUrl]
    );
    return result.rows[0];
  },

  // Get basic stats including assets and chart trends
  async getDashboardStats() {
    const employees = await pool.query('SELECT COUNT(*) as count FROM employee_profiles');
    const activeEmployees = await pool.query("SELECT COUNT(*) as count FROM employee_profiles WHERE status = 'active'");
    const departments = await pool.query('SELECT COUNT(*) as count FROM departments');
    const skills = await pool.query('SELECT COUNT(*) as count FROM skills');
    const images = await pool.query('SELECT COUNT(*) as count FROM employee_images');
    
    // Asset counts
    const assets = await pool.query('SELECT COUNT(*) as count FROM assets');
    const allocatedAssets = await pool.query("SELECT COUNT(*) as count FROM assets WHERE status = 'Allocated'");

    // Department wise employee distribution (for Pie/Bar Chart)
    const deptDistribution = await pool.query(`
      SELECT d.department_name AS name, COUNT(ep.id)::int AS count
      FROM departments d
      LEFT JOIN employee_profiles ep ON d.id = ep.department_id
      GROUP BY d.department_name
    `);

    // Monthly hiring trend (for Area/Line Chart)
    const hiringTrend = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') AS month, COUNT(*)::int AS count
      FROM employee_profiles
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
      LIMIT 12
    `);

    // Work Mode distribution (for Donut Chart)
    const workModeDistribution = await pool.query(`
      SELECT COALESCE(work_mode, 'offline') AS name, COUNT(*)::int AS count
      FROM employee_profiles
      GROUP BY work_mode
    `);

    // City-wise distribution (for Bar Chart)
    const cityDistribution = await pool.query(`
      SELECT COALESCE(city, 'Unspecified') AS name, COUNT(*)::int AS count
      FROM employee_profiles
      GROUP BY city
      ORDER BY count DESC
      LIMIT 10
    `);

    // Today's attendance counts
    const attendanceToday = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'present')::int AS present_today,
        COUNT(*) FILTER (WHERE status = 'absent')::int AS absent_today,
        COUNT(*) FILTER (WHERE status = 'late')::int AS late_today,
        COUNT(*) FILTER (WHERE status = 'half_day')::int AS half_day_today,
        COUNT(*)::int AS total_today
      FROM attendance_records
      WHERE date = CURRENT_DATE
    `);

    // Overall attendance percentage
    const overallAttendance = await pool.query(`
      SELECT 
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(COUNT(*) FILTER (WHERE status IN ('present', 'late', 'half_day'))::NUMERIC / COUNT(*)::NUMERIC * 100, 1)
          ELSE 100.0 END AS overall_percentage
      FROM attendance_records
    `);

    // Monthly salary totals
    const salaryTotal = await pool.query(`
      SELECT COALESCE(SUM(salary), 0)::numeric AS total_payroll_cost
      FROM employee_profiles
      WHERE status = 'active'
    `);

    // Attendance trend for the last 7 days (for Line Chart)
    const attendanceTrend = await pool.query(`
      SELECT TO_CHAR(date, 'DD Mon') AS day, 
             COUNT(*) FILTER (WHERE status IN ('present', 'late', 'half_day'))::int AS present,
             COUNT(*) FILTER (WHERE status = 'absent')::int AS absent
      FROM attendance_records
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date, TO_CHAR(date, 'DD Mon')
      ORDER BY date ASC
    `);

    return {
      total_employees: parseInt(employees.rows[0].count),
      active_employees: parseInt(activeEmployees.rows[0].count),
      total_departments: parseInt(departments.rows[0].count),
      total_skills: parseInt(skills.rows[0].count),
      total_images: parseInt(images.rows[0].count),
      total_assets: parseInt(assets.rows[0].count || 0),
      allocated_assets: parseInt(allocatedAssets.rows[0].count || 0),
      department_distribution: deptDistribution.rows,
      hiring_trend: hiringTrend.rows,
      work_mode_distribution: workModeDistribution.rows,
      city_distribution: cityDistribution.rows,
      attendance_today: attendanceToday.rows[0] || { present_today: 0, absent_today: 0, late_today: 0, half_day_today: 0, total_today: 0 },
      overall_attendance_pct: parseFloat(overallAttendance.rows[0].overall_percentage || 100.0),
      total_payroll_cost: parseFloat(salaryTotal.rows[0].total_payroll_cost || 0),
      attendance_trend: attendanceTrend.rows
    };
  }

};

module.exports = employeeRepository;
