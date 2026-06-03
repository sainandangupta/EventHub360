const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');

// GET all departments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new department
router.post('/', protect, async (req, res) => {
  try {
    const { department_name } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const result = await pool.query(
      'INSERT INTO departments(department_name) VALUES($1) RETURNING *',
      [department_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update department
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name } = req.body;

    const result = await pool.query(
      'UPDATE departments SET department_name = $1 WHERE id = $2 RETURNING *',
      [department_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE department
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM departments WHERE id = $1', [id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
