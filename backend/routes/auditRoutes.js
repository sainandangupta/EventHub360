const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const auditController = require('../controllers/auditController');

// Only Admins are authorized to view system audit logs
router.get('/', protect, authorize(['admin']), auditController.getAuditLogs);

module.exports = router;
