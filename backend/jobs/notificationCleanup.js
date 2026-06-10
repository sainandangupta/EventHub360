const cron = require('node-cron');
const pool = require('../config/db');
const logger = require('../utils/logger');

const scheduleNotificationCleanup = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await pool.query(
        `DELETE FROM notifications WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days' RETURNING id`
      ).catch(() => ({ rowCount: 0 }));
      logger.info('Notification cleanup completed', {
        job: 'notificationCleanup',
        deleted: result.rowCount || 0
      });
    } catch (err) {
      logger.error('Notification cleanup failed', { error: err.message });
    }
  });
};

module.exports = scheduleNotificationCleanup;
