const attendanceService = require('../services/attendanceService');

const attendanceController = {
  async checkIn(req, res, next) {
    try {
      const record = await attendanceService.checkIn(req.user.id);
      res.json({ message: 'Checked in successfully', data: record });
    } catch (err) { next(err); }
  },

  async checkOut(req, res, next) {
    try {
      const record = await attendanceService.checkOut(req.user.id);
      res.json({ message: 'Checked out successfully', data: record });
    } catch (err) { next(err); }
  },

  async getTodayStatus(req, res, next) {
    try {
      const status = await attendanceService.getTodayStatus(req.user.id);
      res.json(status);
    } catch (err) { next(err); }
  },

  async getMyAttendance(req, res, next) {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await attendanceService.getMyAttendance(req.user.id, month, year);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getMyStats(req, res, next) {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const stats = await attendanceService.getMyStats(req.user.id, month, year);
      res.json(stats);
    } catch (err) { next(err); }
  },

  async getDailyAttendance(req, res, next) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const data = await attendanceService.getDailyAttendance(date);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getTodaySummary(req, res, next) {
    try {
      const summary = await attendanceService.getTodaySummary();
      res.json(summary);
    } catch (err) { next(err); }
  },

  async getHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 30;
      const data = await attendanceService.getHistory(req.user.id, limit);
      res.json(data);
    } catch (err) { next(err); }
  }
};

module.exports = attendanceController;
