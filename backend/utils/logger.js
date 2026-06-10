const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
  )
);

const createFileTransport = (filename, level) =>
  new winston.transports.File({ filename: path.join(logsDir, filename), level });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: jsonFormat,
  transports: [
    createFileTransport('error.log', 'error'),
    createFileTransport('combined.log'),
    createFileTransport('api.log', 'http'),
    createFileTransport('login.log', 'info'),
    createFileTransport('security.log', 'warn'),
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'info'
    })
  ]
});

logger.api = (message, meta = {}) => logger.http(message, { type: 'api', ...meta });
logger.login = (message, meta = {}) => logger.info(message, { type: 'login', ...meta });
logger.security = (message, meta = {}) => logger.warn(message, { type: 'security', ...meta });

module.exports = logger;
