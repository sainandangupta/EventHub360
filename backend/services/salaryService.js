const salaryRepository = require('../repositories/salaryRepository');

const salaryService = {
  async getSalaryStructure(employeeId) {
    return salaryRepository.getSalaryStructure(employeeId);
  },

  async upsertSalaryStructure(data) {
    return salaryRepository.upsertSalaryStructure(data);
  },

  async getAllSalaryStructures() {
    return salaryRepository.getAllSalaryStructures();
  },

  async generatePayroll(month, year) {
    return salaryRepository.generatePayroll(month, year);
  },

  async getPayrollReport(month, year) {
    return salaryRepository.getPayrollReport(month, year);
  },

  async getTDSReport(year) {
    return salaryRepository.getTDSReport(year);
  },

  async getPFReport(month, year) {
    return salaryRepository.getPFReport(month, year);
  },

  async getESICReport(month, year) {
    return salaryRepository.getESICReport(month, year);
  },

  async getMonthlySalarySummary() {
    return salaryRepository.getMonthlySalarySummary();
  }
};

module.exports = salaryService;
