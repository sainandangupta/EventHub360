const employeeService = require('../services/employeeService');

const employeeController = {
  // Create profile
  async createEmployee(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.user.id, req.body, req.user.id);
      res.status(201).json({
        message: 'Employee profile created successfully',
        employee_id: employee.id,
        data: employee
      });
    } catch (err) {
      next(err);
    }
  },

  // Get all profiles
  async getAllEmployees(req, res, next) {
    try {
      const employees = await employeeService.getAllEmployees();
      res.json(employees);
    } catch (err) {
      next(err);
    }
  },

  // Get profile by ID
  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  // Update profile
  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await employeeService.updateEmployee(id, req.body, req.user.id);
      res.json({
        message: 'Employee profile updated successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  // Delete profile
  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id, req.user.id);
      res.json({ message: 'Employee profile deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Upload images
  async uploadImages(req, res, next) {
    try {
      const { employeeId } = req.params;
      const images = await employeeService.uploadImages(employeeId, req.files);
      res.json({
        message: `${images.length} images uploaded successfully`,
        count: images.length,
        data: images
      });
    } catch (err) {
      next(err);
    }
  },

  // Get dashboard statistics
  async getDashboardStats(req, res, next) {
    try {
      const stats = await employeeService.getDashboardStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = employeeController;
