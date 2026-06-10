const leaveService = require('../services/leaveService');
const AppError = require('../utils/AppError');

const leaveController = {
  async getLeaveTypes(req, res, next) {
    try {
      res.json(await leaveService.getLeaveTypes());
    } catch (err) { next(err); }
  },

  async getMyBalance(req, res, next) {
    try {
      const employeeId = await leaveService.getEmployeeIdByUserId(req.user.id);
      const year = req.query.year || new Date().getFullYear();
      res.json(await leaveService.getLeaveBalance(employeeId, year));
    } catch (err) { next(err); }
  },

  async applyLeave(req, res, next) {
    try {
      const result = await leaveService.applyLeave(req.user.id, req.body);
      res.status(201).json({ message: 'Leave application submitted successfully', data: result });
    } catch (err) { next(err); }
  },

  async getMyLeaves(req, res, next) {
    try {
      const result = await leaveService.getMyLeaves(req.user.id, req.query);
      res.json(result);
    } catch (err) { next(err); }
  },

  async searchLeaves(req, res, next) {
    try {
      const result = await leaveService.searchLeaves(req.query);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getLeaveById(req, res, next) {
    try {
      const leave = await leaveService.getLeaveById(req.params.id);
      if (!leave) throw AppError.notFound('Leave application not found');
      res.json(leave);
    } catch (err) { next(err); }
  },

  async cancelLeave(req, res, next) {
    try {
      const result = await leaveService.cancelLeave(req.params.id, req.user.id);
      if (!result) throw AppError.badRequest('Cannot cancel this leave');
      res.json({ message: 'Leave application cancelled successfully', data: result });
    } catch (err) { next(err); }
  },

  async getPendingApprovals(req, res, next) {
    try {
      res.json(await leaveService.getPendingApprovals(req.user.id, req.user.role));
    } catch (err) { next(err); }
  },

  async approveLeave(req, res, next) {
    try {
      const { action, remarks } = req.body;
      const result = await leaveService.approveLeave(req.params.id, req.user.id, req.user.role, action, remarks);
      res.json({ message: 'Leave application updated successfully', data: result });
    } catch (err) { next(err); }
  },

  async getApprovalHistory(req, res, next) {
    try {
      res.json(await leaveService.getApprovalHistory(req.params.id));
    } catch (err) { next(err); }
  },

  async getDashboardStats(req, res, next) {
    try {
      res.json(await leaveService.getDashboardStats());
    } catch (err) { next(err); }
  },

  async getReports(req, res, next) {
    try {
      res.json(await leaveService.getReports(req.params.type, req.query.year));
    } catch (err) { next(err); }
  }
};

module.exports = leaveController;
