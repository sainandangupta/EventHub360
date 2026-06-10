const scheduleDailyLeaveReport = require('./dailyLeaveReport');
const scheduleDailyBackup = require('./dailyBackup');
const scheduleNotificationCleanup = require('./notificationCleanup');
const logger = require('../utils/logger');

const startJobs = () => {
  scheduleDailyLeaveReport();
  scheduleDailyBackup();
  scheduleNotificationCleanup();
  logger.info('Background jobs scheduled');
};

module.exports = { startJobs };
