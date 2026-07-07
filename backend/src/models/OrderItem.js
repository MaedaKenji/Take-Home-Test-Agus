'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
  },
  medicineId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'medicine_id',
  },
  quantityRequested: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
    field: 'quantity_requested',
  },
  quantityApproved: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    field: 'quantity_approved',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'order_items',
  underscored: true,
});

module.exports = OrderItem;
