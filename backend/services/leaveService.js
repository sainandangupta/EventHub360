const pool = require('../config/db');
const leaveRepository = require('../repositories/leaveRepository');

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

  // Get current user's leaves
  async getMyLeaves(userId, status) {
    const employeeId = await this.getEmployeeIdByUserId(userId);
    return leaveRepository.getMyLeaves(employeeId, status);
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

  // Approve or reject a leave application
  async approveLeave(leaveId, approverId, role, action, remarks) {
    return leaveRepository.approveLeave(leaveId, approverId, role, action, remarks);
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
        throw new Error(`Unknown report type: ${type}`);
    }
  }
};

module.exports = leaveService;
