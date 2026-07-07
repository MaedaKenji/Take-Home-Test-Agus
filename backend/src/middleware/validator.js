'use strict';
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateMedicine = [
  body('name').trim().notEmpty().withMessage('Nama obat wajib diisi').isLength({ max: 255 }).withMessage('Nama obat maksimal 255 karakter'),
  body('code').trim().notEmpty().withMessage('Kode obat wajib diisi').isLength({ max: 20 }).withMessage('Kode obat maksimal 20 karakter'),
  body('unit').trim().notEmpty().withMessage('Satuan wajib diisi'),
  body('stock').isInt({ min: 0 }).withMessage('Stok harus berupa angka >= 0'),
  body('minStock').optional().isInt({ min: 0 }).withMessage('Stok minimum harus berupa angka >= 0'),
  handleValidationErrors,
];

const validateOrder = [
  body('polyclinic').trim().notEmpty().withMessage('Poliklinik wajib diisi').isLength({ max: 100 }).withMessage('Nama poliklinik maksimal 100 karakter'),
  body('orderDate').notEmpty().withMessage('Tanggal order wajib diisi').isISO8601().withMessage('Format tanggal tidak valid'),
  body('items').isArray({ min: 1 }).withMessage('Order harus memiliki minimal 1 item obat'),
  body('items.*.medicineId').notEmpty().withMessage('ID obat wajib diisi').isUUID().withMessage('ID obat tidak valid'),
  body('items.*.quantityRequested').isInt({ min: 1 }).withMessage('Jumlah yang dipesan harus berupa angka > 0'),
  handleValidationErrors,
];

const validateStatusUpdate = [
  body('status').notEmpty().withMessage('Status wajib diisi').isIn(['pending', 'processing', 'completed', 'cancelled']).withMessage('Status tidak valid'),
  handleValidationErrors,
];

const validateItemsApproval = [
  body('items').isArray({ min: 1 }).withMessage('Data items wajib diisi'),
  body('items.*.itemId').notEmpty().withMessage('Item ID wajib diisi').isUUID().withMessage('Item ID tidak valid'),
  body('items.*.quantityApproved').isInt({ min: 0 }).withMessage('Jumlah yang disetujui harus berupa angka >= 0'),
  handleValidationErrors,
];

module.exports = { validateMedicine, validateOrder, validateStatusUpdate, validateItemsApproval };
