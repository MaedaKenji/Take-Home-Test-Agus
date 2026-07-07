'use strict';
const express = require('express');
const router = express.Router();
const medicineRoutes = require('./medicineRoutes');
const orderRoutes = require('./orderRoutes');
const dashboardController = require('../controllers/dashboardController');

router.use('/medicines', medicineRoutes);
router.use('/orders', orderRoutes);
router.get('/dashboard/stats', dashboardController.getDashboardStats);

module.exports = router;
