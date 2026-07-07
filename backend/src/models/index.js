'use strict';
const sequelize = require('../config/database');
const Medicine = require('./Medicine');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.belongsTo(Medicine, { foreignKey: 'medicineId', as: 'medicine' });
Medicine.hasMany(OrderItem, { foreignKey: 'medicineId', as: 'orderItems' });

module.exports = { sequelize, Medicine, Order, OrderItem };
