const pool = require('../config/db');
const authRepository = require('../repositories/authRepository');
let apiRequestCount = 0;
let failedLoginCount = 0;

const healthController = {
  incrementApiRequest() {
    apiRequestCount++;
  },

  incrementFailedLogin() {
    failedLoginCount++;
  },

  async health(req, res) {
    res.json({ status: 'UP', timestamp: new Date().toISOString() });
  },

  async dashboard(req, res, next) {
    try {
      let dbStatus = 'UP';
      try {
        await pool.query('SELECT 1');
      } catch {
        dbStatus = 'DOWN';
      }

      const totalUsers = await authRepository.countUsers().catch(() => 0);

      res.json({
        status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development'
        },
        database: { status: dbStatus },
        metrics: {
          totalUsers,
          apiRequests: apiRequestCount,
          failedLogins: failedLoginCount
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = healthController;
