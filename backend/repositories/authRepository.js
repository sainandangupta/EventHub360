const pool = require('../config/db');

const authRepository = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async createUser(name, email, hashedPassword) {
    const result = await pool.query(
      `INSERT INTO users(name, email, password) VALUES($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  },

  async updateLastLogin(userId) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
  },

  async countUsers() {
    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return result.rows[0].count;
  },

  async countFailedLoginsToday() {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count FROM audit_logs
       WHERE action = 'LOGIN_FAILED' AND created_at >= CURRENT_DATE`
    ).catch(() => ({ rows: [{ count: 0 }] }));
    return result.rows[0]?.count || 0;
  }
};

module.exports = authRepository;
