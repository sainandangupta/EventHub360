process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { swaggerUi, swaggerSpec } = require('./swagger');
const v1Routes = require('./routes/v1');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const healthController = require('./controllers/healthController');
const { startJobs } = require('./jobs');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(requestLogger);

app.use((req, res, next) => {
  healthController.incrementApiRequest();
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' }
});

// API Versioning: v1 (recommended) + legacy /api for backward compatibility
app.use(['/api/auth', '/api/v1/auth'], authLimiter);
app.use('/api/v1', v1Routes);
app.use('/api', v1Routes);

// Health check (also available at root for load balancers)
app.get('/api/health', healthController.health);
app.get('/health', healthController.health);

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Enterprise file storage structure
app.use('/uploads', express.static('uploads'));

app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  startJobs();
}

const PORT = config.port;

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${config.env}]`);
    logger.info(`Swagger docs: http://localhost:${PORT}/api-docs`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
