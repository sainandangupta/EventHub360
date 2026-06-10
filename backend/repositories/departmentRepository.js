const pool = require('../config/db');

const departmentRepository = {
  async findAll() {
    const result = await pool.query('SELECT * FROM departments ORDER BY id');
    return result.rows;
  },

  async create(departmentName) {
    const result = await pool.query(
      'INSERT INTO departments(department_name) VALUES($1) RETURNING *',
      [departmentName]
    );
    return result.rows[0];
  },

  async update(id, departmentName) {
    const result = await pool.query(
      'UPDATE departments SET department_name = $1 WHERE id = $2 RETURNING *',
      [departmentName, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
  }
};

module.exports = departmentRepository;
