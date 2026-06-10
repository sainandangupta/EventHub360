const express = require('express');
const router = express.Router();

const authRoutes = require('../auth');
const userRoutes = require('../userRoutes');
const forgotPasswordRoutes = require('../forgotPassword');
const emailVerificationRoutes = require('../emailVerification');
const tokenRoutes = require('../tokenRoutes');
const adminRoutes = require('../adminRoutes');
const departmentRoutes = require('../departmentRoutes');
const skillRoutes = require('../skillRoutes');
const roleRoutes = require('../roleRoutes');
const employeeRoutes = require('../employeeRoutes');
const leaveRoutes = require('../leaveRoutes');
const assetRoutes = require('../assetRoutes');
const notificationRoutes = require('../notificationRoutes');
const auditRoutes = require('../auditRoutes');
const healthController = require('../../controllers/healthController');
const protect = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/authorize');

router.get('/health', healthController.health);
router.get('/health/dashboard', protect, authorize(['admin', 'hr']), healthController.dashboard);

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/password', forgotPasswordRoutes);
router.use('/email', emailVerificationRoutes);
router.use('/token', tokenRoutes);
router.use('/admin', adminRoutes);
router.use('/departments', departmentRoutes);
router.use('/skills', skillRoutes);
router.use('/roles', roleRoutes);
router.use('/employees', employeeRoutes);
router.use('/leave', leaveRoutes);
router.use('/assets', assetRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);

module.exports = router;
