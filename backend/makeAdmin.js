const pool = require('./config/db');

async function makeAdmin(email) {
  try {
    const res = await pool.query(
      `UPDATE users SET role = 'admin', verified = true WHERE email = $1 RETURNING *`,
      [email]
    );
    if (res.rows.length === 0) {
      console.log(`User with email "${email}" not found.`);
    } else {
      console.log(`Success! User ${res.rows[0].name} (${email}) is now an admin.`);
    }
  } catch (err) {
    console.error('Error making user admin:', err);
  } finally {
    await pool.end();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please specify email: node makeAdmin.js <email>');
  process.exit(1);
}

makeAdmin(email);
