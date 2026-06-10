const NodeCache = require('node-cache');
const config = require('../config');

const cache = new NodeCache({ stdTTL: config.cache.ttl, checkperiod: 120 });

const cacheService = {
  get(key) {
    return cache.get(key);
  },

  set(key, value, ttl) {
    return cache.set(key, value, ttl || config.cache.ttl);
  },

  del(key) {
    return cache.del(key);
  },

  flush() {
    return cache.flushAll();
  },

  async getOrSet(key, fetchFn, ttl) {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const data = await fetchFn();
    cache.set(key, data, ttl || config.cache.ttl);
    return data;
  }
};

module.exports = cacheService;
