const departmentService = require('../services/departmentService');

const departmentController = {
  async getAll(req, res, next) {
    try {
      const departments = await departmentService.getAll();
      res.json(departments);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const dept = await departmentService.create(req.body.department_name);
      res.status(201).json(dept);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const dept = await departmentService.update(req.params.id, req.body.department_name);
      res.json(dept);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await departmentService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = departmentController;
