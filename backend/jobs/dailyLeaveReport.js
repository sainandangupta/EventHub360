const cron = require('node-cron');
const pool = require('../config/db');
const logger = require('../utils/logger');

const scheduleDailyLeaveReport = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const result = await pool.query(`
        SELECT COUNT(*)::int AS pending,
               (SELECT COUNT(*)::int FROM leave_applications WHERE status = 'approved' AND created_at >= CURRENT_DATE) AS approved_today
        FROM leave_applications WHERE status = 'pending'
      `);
      logger.info('Daily Leave Report', {
        job: 'dailyLeaveReport',
        ...result.rows[0]
      });
    } catch (err) {
      logger.error('Daily Leave Report failed', { error: err.message });
    }
  });
};

module.exports = scheduleDailyLeaveReport;
