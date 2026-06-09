const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const employeeController = require('../controllers/employeeController');
const { createEmployeeSchema, updateEmployeeSchema, validate } = require('../validators/employeeValidators');

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer storage engine configuration
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Employee Profile routes
router.post('/', protect, validate(createEmployeeSchema), employeeController.createEmployee);
router.get('/', protect, employeeController.getAllEmployees);
router.get('/stats/dashboard', protect, employeeController.getDashboardStats);
router.get('/:id', protect, employeeController.getEmployeeById);
router.put('/:id', protect, validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', protect, employeeController.deleteEmployee);

// Image uploading route
router.post('/upload/:employeeId', protect, upload.array('images', 5), employeeController.uploadImages);

module.exports = router;
