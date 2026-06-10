const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const AppError = require('./AppError');

const UPLOAD_DIRS = {
  employees: 'uploads/employees',
  documents: 'uploads/employees/documents',
  certificates: 'uploads/employees/certificates',
  assets: 'uploads/assets'
};

Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const createStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIRS[subdir] || UPLOAD_DIRS.employees),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    }
  });

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetypeOk = allowedTypes.mimes.test(file.mimetype);
  const extOk = allowedTypes.exts.test(ext);
  if (mimetypeOk && extOk) return cb(null, true);
  cb(new Error(`Invalid file type. Allowed: ${allowedTypes.label}`));
};

const imageDocFilter = fileFilter({
  mimes: /jpeg|jpg|png|pdf/,
  exts: /jpeg|jpg|png|pdf/,
  label: 'jpeg, jpg, png, pdf'
});

const assetFileFilter = fileFilter({
  mimes: /jpeg|jpg|png|pdf|doc|docx/,
  exts: /jpeg|jpg|png|pdf|doc|docx/,
  label: 'jpeg, jpg, png, pdf, doc, docx'
});

const createUploader = (subdir, options = {}) =>
  multer({
    storage: createStorage(subdir),
    limits: { fileSize: config.upload.maxFileSize },
    fileFilter: options.fileFilter || imageDocFilter
  });

module.exports = {
  UPLOAD_DIRS,
  employeeUpload: createUploader('employees'),
  documentUpload: createUploader('documents'),
  certificateUpload: createUploader('certificates'),
  assetUpload: createUploader('assets', { fileFilter: assetFileFilter })
};
