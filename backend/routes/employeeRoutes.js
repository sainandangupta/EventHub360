const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const employeeController = require('../controllers/employeeController');
const validate = require('../middleware/validate');
const { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } = require('../validators/employee.validator');
const { employeeUpload } = require('../utils/fileUpload');

router.post('/', protect, validate(createEmployeeSchema), employeeController.createEmployee);
router.get('/', protect, validate(employeeQuerySchema, 'query'), employeeController.getAllEmployees);
router.get('/stats/dashboard', protect, employeeController.getDashboardStats);
router.get('/:id', protect, employeeController.getEmployeeById);
router.put('/:id', protect, validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', protect, employeeController.deleteEmployee);
router.post('/upload/:employeeId', protect, employeeUpload.array('images', 5), employeeController.uploadImages);

module.exports = router;
