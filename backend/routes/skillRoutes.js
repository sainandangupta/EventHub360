const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const protect = require('../middleware/authMiddleware');

// GET all skills
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skills ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new skill
router.post('/', protect, async (req, res) => {
  try {
    const { skill_name } = req.body;
    
    if (!skill_name) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const result = await pool.query(
      'INSERT INTO skills(skill_name) VALUES($1) RETURNING *',
      [skill_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update skill
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { skill_name } = req.body;

    const result = await pool.query(
      'UPDATE skills SET skill_name = $1 WHERE id = $2 RETURNING *',
      [skill_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE skill
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM skills WHERE id = $1', [id]);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
