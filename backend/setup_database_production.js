const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Error: Please provide the database connection string as an argument or set DATABASE_URL.');
  console.error('Usage: node setup_database_production.js <database_url>');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

const coreTablesSql = `
-- Table 1: Departments
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- Insert sample departments
INSERT INTO departments(department_name)
VALUES
('IT'),
('HR'),
('Finance'),
('Marketing')
ON CONFLICT (department_name) DO NOTHING;

-- Table 2: Skills
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);

-- Insert sample skills
INSERT INTO skills(skill_name)
VALUES
('React'),
('NodeJS'),
('PostgreSQL'),
('Python'),
('Java')
ON CONFLICT (skill_name) DO NOTHING;

-- Table 3: Employee Profiles
CREATE TABLE IF NOT EXISTS employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    address TEXT,
    designation VARCHAR(100),
    salary NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Employee Images
CREATE TABLE IF NOT EXISTS employee_images (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    image_url TEXT
);

-- Table 5: Employee Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employee_profiles(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(employee_id, skill_id)
);
`;

async function setup() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    
    const readSqlFile = (fileName, ...subDirs) => {
      const filePath = path.join(__dirname, ...subDirs, fileName);
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.startsWith('\ufeff')) {
        content = content.slice(1);
      }
      return content;
    };

    // 1. db_setup.sql
    console.log('Executing db_setup.sql...');
    const dbSetupSql = readSqlFile('db_setup.sql');
    await client.query(dbSetupSql);
    
    // 2. Core Tables
    console.log('Creating core tables (departments, skills, employee_profiles)...');
    await client.query(coreTablesSql);
    
    // 3. employee_schema_update.sql
    console.log('Executing employee_schema_update.sql...');
    const employeeSchemaSql = readSqlFile('employee_schema_update.sql');
    await client.query(employeeSchemaSql);
    
    // 4. leave_setup.sql
    console.log('Executing leave_setup.sql...');
    const leaveSetupSql = readSqlFile('leave_setup.sql');
    await client.query(leaveSetupSql);
    
    // 5. assets_setup.sql
    console.log('Executing assets_setup.sql...');
    const assetsSetupSql = readSqlFile('assets_setup.sql');
    await client.query(assetsSetupSql);
    
    // 6. attendance_setup.sql
    console.log('Executing attendance_setup.sql...');
    const attendanceSetupSql = readSqlFile('attendance_setup.sql');
    await client.query(attendanceSetupSql);
    
    // 7. salary_setup.sql
    console.log('Executing salary_setup.sql...');
    const salarySetupSql = readSqlFile('salary_setup.sql');
    await client.query(salarySetupSql);
    
    // 8. production_optimization.sql
    console.log('Executing production_optimization.sql...');
    const optimizationSql = readSqlFile('production_optimization.sql', 'sql');
    await client.query(optimizationSql);
    
    console.log('🎉 Database setup completed successfully! All tables, stored procedures, views, and indexes are ready.');
  } catch (err) {
    console.error('❌ Error during database setup:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
