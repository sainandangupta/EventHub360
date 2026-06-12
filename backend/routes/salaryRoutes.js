const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const salaryController = require('../controllers/salaryController');

router.get('/structures', protect, salaryController.getAllSalaryStructures);
router.get('/structure/:employeeId', protect, salaryController.getSalaryStructure);
router.post('/structure', protect, salaryController.upsertSalaryStructure);
router.post('/payroll/generate', protect, salaryController.generatePayroll);
router.get('/payroll', protect, salaryController.getPayrollReport);
router.get('/reports/tds', protect, salaryController.getTDSReport);
router.get('/reports/pf', protect, salaryController.getPFReport);
router.get('/reports/esic', protect, salaryController.getESICReport);
router.get('/reports/monthly-summary', protect, salaryController.getMonthlySummary);

module.exports = router;
