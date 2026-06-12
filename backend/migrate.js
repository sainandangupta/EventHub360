const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting DB migrations...');

    // 1. employee_schema_update.sql
    const employeeSql = fs.readFileSync(path.join(__dirname, 'employee_schema_update.sql'), 'utf8');
    console.log('Executing employee_schema_update.sql...');
    await client.query(employeeSql);

    // 2. attendance_setup.sql
    const attendanceSql = fs.readFileSync(path.join(__dirname, 'attendance_setup.sql'), 'utf8');
    console.log('Executing attendance_setup.sql...');
    await client.query(attendanceSql);

    // 3. salary_setup.sql
    const salarySql = fs.readFileSync(path.join(__dirname, 'salary_setup.sql'), 'utf8');
    console.log('Executing salary_setup.sql...');
    await client.query(salarySql);

    console.log('All DB migrations executed successfully.');
  } catch (err) {
    console.error('Error during migrations:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
