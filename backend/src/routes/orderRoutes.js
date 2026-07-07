'use strict';
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrder, validateStatusUpdate, validateItemsApproval } = require('../middleware/validator');

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', validateOrder, orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.patch('/:id/status', validateStatusUpdate, orderController.updateStatus);
router.patch('/:id/items', validateItemsApproval, orderController.updateOrderItems);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
