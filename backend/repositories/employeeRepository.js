const pool = require('../config/db');

const employeeRepository = {
  // Create profile
  async createEmployee(userId, departmentId, phone, address, designation, salary) {
    const result = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, departmentId, phone, address, designation, salary]
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

  // Get all profiles
  async getAllEmployees() {
    const result = await pool.query(`
      SELECT 
        ep.id,
        u.name,
        u.email,
        d.department_name,
        ep.designation,
        ep.salary,
        ep.phone,
        ep.created_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ORDER BY ep.id DESC
    `);
    return result.rows;
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
  async updateEmployee(id, departmentId, phone, address, designation, salary) {
    const result = await pool.query(
      `UPDATE employee_profiles 
       SET department_id = $1, phone = $2, address = $3, designation = $4, salary = $5
       WHERE id = $6
       RETURNING *`,
      [departmentId, phone, address, designation, salary, id]
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

    return {
      total_employees: parseInt(employees.rows[0].count),
      total_departments: parseInt(departments.rows[0].count),
      total_skills: parseInt(skills.rows[0].count),
      total_images: parseInt(images.rows[0].count),
      total_assets: parseInt(assets.rows[0].count || 0),
      allocated_assets: parseInt(allocatedAssets.rows[0].count || 0),
      department_distribution: deptDistribution.rows,
      hiring_trend: hiringTrend.rows
    };
  }

};

module.exports = employeeRepository;
