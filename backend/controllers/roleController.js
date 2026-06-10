const roleService = require('../services/roleService');

const roleController = {
  async getAll(req, res, next) {
    try {
      res.json(await roleService.getAll());
    } catch (err) {
      next(err);
    }
  }
};

module.exports = roleController;
