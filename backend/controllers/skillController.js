const skillService = require('../services/skillService');

const skillController = {
  async getAll(req, res, next) {
    try {
      const skills = await skillService.getAll();
      res.json(skills);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const skill = await skillService.create(req.body.skill_name);
      res.status(201).json(skill);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const skill = await skillService.update(req.params.id, req.body.skill_name);
      res.json(skill);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const result = await skillService.delete(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = skillController;
