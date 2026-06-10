const pool = require('../config/db');

const skillRepository = {
  async findAll() {
    const result = await pool.query('SELECT * FROM skills ORDER BY id');
    return result.rows;
  },

  async create(skillName) {
    const result = await pool.query(
      'INSERT INTO skills(skill_name) VALUES($1) RETURNING *',
      [skillName]
    );
    return result.rows[0];
  },

  async update(id, skillName) {
    const result = await pool.query(
      'UPDATE skills SET skill_name = $1 WHERE id = $2 RETURNING *',
      [skillName, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM skills WHERE id = $1', [id]);
  }
};

module.exports = skillRepository;
