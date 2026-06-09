const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/', protect, notificationController.getMyNotifications);
router.put('/mark-all', protect, notificationController.markAllAsRead);
router.put('/:id/read', protect, notificationController.markAsRead);
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
