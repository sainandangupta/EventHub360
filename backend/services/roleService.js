const cacheService = require('../utils/cache');
const CACHE_KEYS = require('../constants/cacheKeys');
const ROLES = require('../constants/roles');

const roleService = {
  async getAll() {
    return cacheService.getOrSet(CACHE_KEYS.ROLES, async () => ROLES.ALL_ROLES);
  }
};

module.exports = roleService;
