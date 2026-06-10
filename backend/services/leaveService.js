const pool = require('../config/db');
const AppError = require('../utils/AppError');
const leaveRepository = require('../repositories/leaveRepository');
const emailService = require('./emailService');

const leaveService = {
  // Helper: get employee_id from user_id
  async getEmployeeIdByUserId(userId) {
    const result = await pool.query(
      'SELECT id FROM employee_profiles WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      throw new Error('Employee profile not found for this user');
    }
    return result.rows[0].id;
  },

  // Get all leave types
  async getLeaveTypes() {
    return leaveRepository.getLeaveTypes();
  },

  // Get leave balance for the current user
  async getLeaveBalance(employeeId, year) {
    return leaveRepository.getLeaveBalance(employeeId, year);
  },

  // Apply for leave
  async applyLeave(userId, data) {
    const employeeId = await this.getEmployeeIdByUserId(userId);
    const { leave_type_id, from_date, to_date, total_days, reason } = data;
    return leaveRepository.applyLeave(employeeId, leave_type_id, from_date, to_date, total_days, reason);
  },

  async getMyLeaves(userId, query = {}) {
    const employeeId = await this.getEmployeeIdByUserId(userId);
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;
    const { rows, total } = await leaveRepository.getMyLeaves(employeeId, {
      status: query.status,
      search: query.search,
      limit,
      offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    });
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async searchLeaves(query = {}) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const offset = (page - 1) * limit;
    const { rows, total } = await leaveRepository.searchLeaves({
      search: query.search,
      status: query.status,
      limit,
      offset,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder
    });
    return { data: rows, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Get leave by ID
  async getLeaveById(id) {
    return leaveRepository.getLeaveById(id);
  },

  // Cancel a leave application
  async cancelLeave(leaveId, userId) {
    const employeeId = await this.getEmployeeIdByUserId(userId);
    return leaveRepository.cancelLeave(leaveId, employeeId);
  },

  // Get pending approvals based on role
  async getPendingApprovals(userId, role) {
    if (role === 'manager') {
      return leaveRepository.getPendingForManager(userId);
    } else if (role === 'hr') {
      return leaveRepository.getPendingForHR();
    }
    throw new Error('Invalid role for approvals');
  },

  async approveLeave(leaveId, approverId, role, action, remarks) {
    const result = await leaveRepository.approveLeave(leaveId, approverId, role, action, remarks);
    if (action === 'hr_approved') {
      const leave = await leaveRepository.getLeaveById(leaveId);
      if (leave?.employee_email) {
        emailService.sendLeaveApprovedEmail(leave.employee_email, leave.employee_name, leave).catch(() => {});
      }
    }
    return result;
  },

  // Get approval history for a leave
  async getApprovalHistory(leaveId) {
    return leaveRepository.getApprovalHistory(leaveId);
  },

  // Get dashboard statistics
  async getDashboardStats() {
    return leaveRepository.getDashboardStats();
  },

  // Get reports by type
  async getReports(type, year) {
    const reportYear = year || new Date().getFullYear();

    switch (type) {
      case 'employee-wise':
        return leaveRepository.getEmployeeWiseReport(reportYear);
      case 'department-wise':
        return leaveRepository.getDepartmentWiseReport(reportYear);
      case 'monthly-trend':
        return leaveRepository.getMonthlyTrendReport(reportYear);
      case 'most-absent':
        return leaveRepository.getMostAbsentEmployees(reportYear);
      case 'leave-balance':
        return leaveRepository.getLeaveBalanceReport(reportYear);
      case 'rankings':
        return leaveRepository.getLeaveRankings(reportYear);
      default:
        throw AppError.badRequest(`Unknown report type: ${type}`);
    }
  }
};

module.exports = leaveService;
