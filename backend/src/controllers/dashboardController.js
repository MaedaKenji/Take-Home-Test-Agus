'use strict';
const { Op } = require('sequelize');
const { sequelize, Order, Medicine } = require('../models');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86400000);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalMedicines,
      lowStockCount,
    ] = await Promise.all([
      Order.count(),
      Order.count({ where: { createdAt: { [Op.gte]: todayStart, [Op.lt]: todayEnd } } }),
      Order.count({ where: { status: 'pending' } }),
      Order.count({ where: { status: 'processing' } }),
      Order.count({ where: { status: 'completed' } }),
      Order.count({ where: { status: 'cancelled' } }),
      Medicine.count(),
      Medicine.count({
        where: sequelize.where(sequelize.col('stock'), { [Op.lte]: sequelize.col('min_stock') }),
      }),
    ]);

    res.json({
      success: true,
      data: {
        orders: { total: totalOrders, today: todayOrders, pending: pendingOrders, processing: processingOrders, completed: completedOrders, cancelled: cancelledOrders },
        medicines: { total: totalMedicines, lowStock: lowStockCount },
      },
    });
  } catch (err) {
    next(err);
  }
};
