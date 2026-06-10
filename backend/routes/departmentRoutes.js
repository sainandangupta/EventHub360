const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getAll);
router.post('/', protect, departmentController.create);
router.put('/:id', protect, departmentController.update);
router.delete('/:id', protect, departmentController.delete);

module.exports = router;
