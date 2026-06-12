const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const attendanceController = require('../controllers/attendanceController');

router.post('/check-in', protect, attendanceController.checkIn);
router.post('/check-out', protect, attendanceController.checkOut);
router.get('/today', protect, attendanceController.getTodayStatus);
router.get('/my-attendance', protect, attendanceController.getMyAttendance);
router.get('/stats', protect, attendanceController.getMyStats);
router.get('/daily', protect, attendanceController.getDailyAttendance);
router.get('/summary', protect, attendanceController.getTodaySummary);
router.get('/history', protect, attendanceController.getHistory);

module.exports = router;
