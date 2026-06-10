const AppError = require('../utils/AppError');
const cacheService = require('../utils/cache');
const CACHE_KEYS = require('../constants/cacheKeys');
const skillRepository = require('../repositories/skillRepository');

const skillService = {
  async getAll() {
    return cacheService.getOrSet(CACHE_KEYS.SKILLS, () => skillRepository.findAll());
  },

  async create(skillName) {
    if (!skillName) throw AppError.validation('Skill name is required');
    const skill = await skillRepository.create(skillName);
    cacheService.del(CACHE_KEYS.SKILLS);
    return skill;
  },

  async update(id, skillName) {
    const skill = await skillRepository.update(id, skillName);
    if (!skill) throw AppError.notFound('Skill not found');
    cacheService.del(CACHE_KEYS.SKILLS);
    return skill;
  },

  async delete(id) {
    await skillRepository.delete(id);
    cacheService.del(CACHE_KEYS.SKILLS);
    return { message: 'Skill deleted' };
  }
};

module.exports = skillService;
