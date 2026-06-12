const salaryService = require('../services/salaryService');

const salaryController = {
  async getSalaryStructure(req, res, next) {
    try {
      const { employeeId } = req.params;
      const data = await salaryService.getSalaryStructure(employeeId);
      res.json(data || {});
    } catch (err) { next(err); }
  },

  async upsertSalaryStructure(req, res, next) {
    try {
      const data = await salaryService.upsertSalaryStructure(req.body);
      res.json({ message: 'Salary structure saved', data });
    } catch (err) { next(err); }
  },

  async getAllSalaryStructures(req, res, next) {
    try {
      const data = await salaryService.getAllSalaryStructures();
      res.json(data);
    } catch (err) { next(err); }
  },

  async generatePayroll(req, res, next) {
    try {
      const month = parseInt(req.body.month) || new Date().getMonth() + 1;
      const year = parseInt(req.body.year) || new Date().getFullYear();
      const data = await salaryService.generatePayroll(month, year);
      res.json({ message: `Payroll generated for ${month}/${year}`, count: data.length, data });
    } catch (err) { next(err); }
  },

  async getPayrollReport(req, res, next) {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await salaryService.getPayrollReport(month, year);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getTDSReport(req, res, next) {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await salaryService.getTDSReport(year);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getPFReport(req, res, next) {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await salaryService.getPFReport(month, year);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getESICReport(req, res, next) {
    try {
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const data = await salaryService.getESICReport(month, year);
      res.json(data);
    } catch (err) { next(err); }
  },

  async getMonthlySummary(req, res, next) {
    try {
      const data = await salaryService.getMonthlySalarySummary();
      res.json(data);
    } catch (err) { next(err); }
  }
};

module.exports = salaryController;
