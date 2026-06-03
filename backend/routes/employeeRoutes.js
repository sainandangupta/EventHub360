const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images and PDFs Only!');
    }
  }
});

// POST create employee
router.post('/', protect, async (req, res) => {
  try {
    const { phone, address, designation, salary, department_id, skills } = req.body;
    const userId = req.user.id;

    if (!phone || !address || !designation || !salary || !department_id) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create employee profile
    const result = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, department_id, phone, address, designation, salary]
    );

    const employeeId = result.rows[0].id;

    // Add skills
    if (skills && skills.length > 0) {
      for (let skillId of skills) {
        await pool.query(
          'INSERT INTO employee_skills(employee_id, skill_id) VALUES($1, $2)',
          [employeeId, skillId]
        );
      }
    }

    res.status(201).json({ 
      message: 'Employee created successfully', 
      employee_id: employeeId 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all employees
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ep.id,
        u.name,
        d.department_name,
        ep.designation,
        ep.salary,
        ep.phone,
        ep.created_at
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ORDER BY ep.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET employee by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const employee = await pool.query(`
      SELECT 
        ep.*,
        u.name,
        d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      WHERE ep.id = $1
    `, [id]);

    if (employee.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Get employee skills
    const skills = await pool.query(`
      SELECT s.id, s.skill_name
      FROM employee_skills es
      INNER JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [id]);

    // Get employee images
    const images = await pool.query(`
      SELECT * FROM employee_images WHERE employee_id = $1
    `, [id]);

    res.json({
      ...employee.rows[0],
      skills: skills.rows,
      images: images.rows
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update employee
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, address, designation, salary, department_id, skills } = req.body;

    await pool.query(
      `UPDATE employee_profiles 
       SET phone = $1, address = $2, designation = $3, salary = $4, department_id = $5
       WHERE id = $6`,
      [phone, address, designation, salary, department_id, id]
    );

    // Update skills
    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    
    if (skills && skills.length > 0) {
      for (let skillId of skills) {
        await pool.query(
          'INSERT INTO employee_skills(employee_id, skill_id) VALUES($1, $2)',
          [id, skillId]
        );
      }
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE employee
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM employee_skills WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM employee_images WHERE employee_id = $1', [id]);
    await pool.query('DELETE FROM employee_profiles WHERE id = $1', [id]);
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload images
router.post('/upload/:employeeId', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    for (let file of req.files) {
      await pool.query(
        'INSERT INTO employee_images(employee_id, image_url) VALUES($1, $2)',
        [employeeId, file.filename]
      );
    }

    res.json({ 
      message: `${req.files.length} images uploaded successfully`,
      count: req.files.length 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET dashboard stats
router.get('/stats/dashboard', protect, async (req, res) => {
  try {
    const employees = await pool.query('SELECT COUNT(*) as count FROM employee_profiles');
    const departments = await pool.query('SELECT COUNT(*) as count FROM departments');
    const skills = await pool.query('SELECT COUNT(*) as count FROM skills');
    const images = await pool.query('SELECT COUNT(*) as count FROM employee_images');

    res.json({
      total_employees: parseInt(employees.rows[0].count),
      total_departments: parseInt(departments.rows[0].count),
      total_skills: parseInt(skills.rows[0].count),
      total_images: parseInt(images.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
