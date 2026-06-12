const pool = require('../config/db');

const salaryRepository = {
  async getSalaryStructure(employeeId) {
    const result = await pool.query(
      `SELECT ss.*, u.name AS employee_name, d.department_name, ep.designation
       FROM salary_structure ss
       INNER JOIN employee_profiles ep ON ss.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE ss.employee_id = $1
       ORDER BY ss.effective_from DESC LIMIT 1`,
      [employeeId]
    );
    return result.rows[0];
  },

  async upsertSalaryStructure(data) {
    const { employee_id, basic_salary, hra, allowances, bonus, deductions, tds, pf, esic } = data;
    const net_salary = (basic_salary || 0) + (hra || 0) + (allowances || 0) + (bonus || 0)
      - (deductions || 0) - (tds || 0) - (pf || 0) - (esic || 0);

    const result = await pool.query(
      `INSERT INTO salary_structure (employee_id, basic_salary, hra, allowances, bonus, deductions, tds, pf, esic, net_salary, effective_from)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
       ON CONFLICT (employee_id, effective_from) DO UPDATE SET
         basic_salary = $2, hra = $3, allowances = $4, bonus = $5, deductions = $6,
         tds = $7, pf = $8, esic = $9, net_salary = $10
       RETURNING *`,
      [employee_id, basic_salary || 0, hra || 0, allowances || 0, bonus || 0, deductions || 0, tds || 0, pf || 0, esic || 0, net_salary]
    );
    return result.rows[0];
  },

  async getAllSalaryStructures() {
    const result = await pool.query(
      `SELECT DISTINCT ON (ss.employee_id) ss.*, u.name AS employee_name, d.department_name, ep.designation
       FROM salary_structure ss
       INNER JOIN employee_profiles ep ON ss.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       ORDER BY ss.employee_id, ss.effective_from DESC`
    );
    return result.rows;
  },

  async generatePayroll(month, year) {
    // Generate payroll from latest salary structures for all employees
    const result = await pool.query(
      `INSERT INTO payroll_runs (employee_id, month, year, basic_salary, hra, allowances, bonus, deductions, tds, pf, esic, net_salary, status)
       SELECT DISTINCT ON (ss.employee_id)
         ss.employee_id, $1, $2, ss.basic_salary, ss.hra, ss.allowances, ss.bonus,
         ss.deductions, ss.tds, ss.pf, ss.esic, ss.net_salary, 'processed'
       FROM salary_structure ss
       INNER JOIN employee_profiles ep ON ss.employee_id = ep.id
       WHERE ep.status = 'active'
       ORDER BY ss.employee_id, ss.effective_from DESC
       ON CONFLICT (employee_id, month, year) DO UPDATE SET
         basic_salary = EXCLUDED.basic_salary, hra = EXCLUDED.hra, allowances = EXCLUDED.allowances,
         bonus = EXCLUDED.bonus, deductions = EXCLUDED.deductions, tds = EXCLUDED.tds,
         pf = EXCLUDED.pf, esic = EXCLUDED.esic, net_salary = EXCLUDED.net_salary, status = 'processed'
       RETURNING *`,
      [month, year]
    );
    return result.rows;
  },

  async getPayrollReport(month, year) {
    const result = await pool.query(
      `SELECT pr.*, u.name AS employee_name, d.department_name, ep.designation
       FROM payroll_runs pr
       INNER JOIN employee_profiles ep ON pr.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE pr.month = $1 AND pr.year = $2
       ORDER BY u.name`,
      [month, year]
    );
    return result.rows;
  },

  async getTDSReport(year) {
    const result = await pool.query(
      `SELECT u.name AS employee_name, d.department_name, 
              SUM(pr.tds)::numeric AS total_tds,
              SUM(pr.basic_salary)::numeric AS total_basic,
              SUM(pr.net_salary)::numeric AS total_net
       FROM payroll_runs pr
       INNER JOIN employee_profiles ep ON pr.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE pr.year = $1
       GROUP BY u.name, d.department_name
       ORDER BY u.name`,
      [year]
    );
    return result.rows;
  },

  async getPFReport(month, year) {
    const result = await pool.query(
      `SELECT u.name AS employee_name, d.department_name, pr.basic_salary, pr.pf,
              ROUND(pr.basic_salary * 0.12, 2) AS employer_pf
       FROM payroll_runs pr
       INNER JOIN employee_profiles ep ON pr.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE pr.month = $1 AND pr.year = $2
       ORDER BY u.name`,
      [month, year]
    );
    return result.rows;
  },

  async getESICReport(month, year) {
    const result = await pool.query(
      `SELECT u.name AS employee_name, d.department_name, pr.net_salary, pr.esic,
              ROUND(pr.net_salary * 0.0325, 2) AS employer_esic
       FROM payroll_runs pr
       INNER JOIN employee_profiles ep ON pr.employee_id = ep.id
       INNER JOIN users u ON ep.user_id = u.id
       INNER JOIN departments d ON ep.department_id = d.id
       WHERE pr.month = $1 AND pr.year = $2
       ORDER BY u.name`,
      [month, year]
    );
    return result.rows;
  },

  async getMonthlySalarySummary() {
    const result = await pool.query(
      `SELECT month, year, 
              SUM(net_salary)::numeric AS total_payroll,
              COUNT(*)::int AS employee_count
       FROM payroll_runs
       GROUP BY month, year
       ORDER BY year DESC, month DESC
       LIMIT 12`
    );
    return result.rows;
  }
};

module.exports = salaryRepository;
