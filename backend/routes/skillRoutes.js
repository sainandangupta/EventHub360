const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const skillController = require('../controllers/skillController');

router.get('/', skillController.getAll);
router.post('/', protect, skillController.create);
router.put('/:id', protect, skillController.update);
router.delete('/:id', protect, skillController.delete);

module.exports = router;
