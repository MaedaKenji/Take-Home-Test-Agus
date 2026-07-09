'use strict';
const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { validateMedicine } = require('../middleware/validator');

router.get('/low-stock', medicineController.getLowStockMedicines);
router.get('/units', medicineController.getUnits);
router.get('/', medicineController.getMedicines);
router.get('/:id', medicineController.getMedicineById);
router.post('/', validateMedicine, medicineController.createMedicine);
router.put('/:id', validateMedicine, medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router;
