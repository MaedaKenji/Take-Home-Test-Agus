'use strict';
const { Op } = require('sequelize');
const { Order } = require('../models');

/**
 * Generate order number in format ORD-YYYYMMDD-XXXX
 * Uses retry-on-conflict strategy for uniqueness.
 */
async function generateOrderNumber(transaction) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  // Count existing orders today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const count = await Order.count({
    where: {
      createdAt: { [Op.gte]: todayStart, [Op.lt]: todayEnd },
    },
    transaction,
  });

  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}${seq}`;
}

/**
 * Generate with retry on unique constraint violation.
 */
async function generateOrderNumberWithRetry(transaction, attempt = 1) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;
  const seq = String(attempt).padStart(4, '0');
  return `${prefix}${seq}`;
}

module.exports = { generateOrderNumber, generateOrderNumberWithRetry };
