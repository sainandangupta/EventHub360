const attendanceRepository = require('../repositories/attendanceRepository');
const employeeRepository = require('../repositories/employeeRepository');
const AppError = require('../utils/AppError');

const attendanceService = {
  async checkIn(userId) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) throw AppError.notFound('Employee profile not found. Create one first.');

    const today = await attendanceRepository.getTodayStatus(employee.id);
    if (today && today.check_in) {
      throw AppError.badRequest('Already checked in today at ' + new Date(today.check_in).toLocaleTimeString());
    }

    return attendanceRepository.checkIn(employee.id);
  },

  async checkOut(userId) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) throw AppError.notFound('Employee profile not found.');

    const today = await attendanceRepository.getTodayStatus(employee.id);
    if (!today || !today.check_in) {
      throw AppError.badRequest('You have not checked in today.');
    }
    if (today.check_out) {
      throw AppError.badRequest('Already checked out today at ' + new Date(today.check_out).toLocaleTimeString());
    }

    return attendanceRepository.checkOut(employee.id);
  },

  async getTodayStatus(userId) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) return { checked_in: false, employee_id: null };
    const today = await attendanceRepository.getTodayStatus(employee.id);
    return { ...today, employee_id: employee.id };
  },

  async getMyAttendance(userId, month, year) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) throw AppError.notFound('Employee profile not found.');
    return attendanceRepository.getMonthlyAttendance(employee.id, month, year);
  },

  async getMyStats(userId, month, year) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) throw AppError.notFound('Employee profile not found.');
    const monthly = await attendanceRepository.getAttendanceStats(employee.id, month, year);
    const overall = await attendanceRepository.getOverallStats(employee.id);
    return { monthly, overall };
  },

  async getDailyAttendance(date) {
    return attendanceRepository.getDailyAttendance(date);
  },

  async getTodaySummary() {
    return attendanceRepository.getTodaySummary();
  },

  async getHistory(userId, limit) {
    const employee = await employeeRepository.getEmployeeByUserId(userId);
    if (!employee) throw AppError.notFound('Employee profile not found.');
    return attendanceRepository.getAttendanceHistory(employee.id, limit);
  }
};

module.exports = attendanceService;
