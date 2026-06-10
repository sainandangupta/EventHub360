const authService = require('../services/authService');

const authController = {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body, req.ip);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = authController;
