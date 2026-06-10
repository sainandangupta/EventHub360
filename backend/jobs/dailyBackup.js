const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const backupDir = path.join(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const scheduleDailyBackup = () => {
  cron.schedule('0 2 * * *', () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      const metadata = {
        timestamp: new Date().toISOString(),
        type: 'metadata-backup',
        note: 'Run pg_dump for full DB backup in production'
      };
      fs.writeFileSync(backupFile, JSON.stringify(metadata, null, 2));
      logger.info('Daily backup metadata created', { file: backupFile });
    } catch (err) {
      logger.error('Daily backup failed', { error: err.message });
    }
  });
};

module.exports = scheduleDailyBackup;
