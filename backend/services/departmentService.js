const AppError = require('../utils/AppError');
const cacheService = require('../utils/cache');
const CACHE_KEYS = require('../constants/cacheKeys');
const departmentRepository = require('../repositories/departmentRepository');

const departmentService = {
  async getAll() {
    return cacheService.getOrSet(CACHE_KEYS.DEPARTMENTS, () => departmentRepository.findAll());
  },

  async create(departmentName) {
    if (!departmentName) throw AppError.validation('Department name is required');
    const dept = await departmentRepository.create(departmentName);
    cacheService.del(CACHE_KEYS.DEPARTMENTS);
    return dept;
  },

  async update(id, departmentName) {
    const dept = await departmentRepository.update(id, departmentName);
    if (!dept) throw AppError.notFound('Department not found');
    cacheService.del(CACHE_KEYS.DEPARTMENTS);
    return dept;
  },

  async delete(id) {
    await departmentRepository.delete(id);
    cacheService.del(CACHE_KEYS.DEPARTMENTS);
    return { message: 'Department deleted' };
  }
};

module.exports = departmentService;
