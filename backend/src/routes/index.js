'use strict';
const express = require('express');
const router = express.Router();
const medicineRoutes = require('./medicineRoutes');
const orderRoutes = require('./orderRoutes');
const categoryRoutes = require('./categoryRoutes');
const authRoutes = require('./authRoutes');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require JWT)
router.use(authenticate);
router.use('/medicines', medicineRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.get('/dashboard/stats', dashboardController.getDashboardStats);

module.exports = router;
