const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.name,
  password: config.db.password,
  port: config.db.port
});

module.exports = pool;
