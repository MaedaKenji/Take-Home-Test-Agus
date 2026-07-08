'use strict';
const { Sequelize } = require('sequelize');
const { sequelize, Order, OrderItem, Medicine } = require('../models');
const { generateOrderNumber } = require('../utils/orderNumberGenerator');
const AppError = require('../utils/AppError');

// Valid status transitions
const VALID_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const { status, date, limit = 20, page = 1, sort = 'createdAt:desc' } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) where.orderDate = date;

    const [sortField, sortDir] = sort.split(':');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine', attributes: ['id', 'name', 'unit'] }] }],
      order: [[sortField || 'createdAt', (sortDir || 'desc').toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      meta: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    });
    if (!order) throw new AppError(404, 'Order tidak ditemukan');
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { polyclinic, orderDate, notes, requestedBy, items } = req.body;

    // Validate medicines exist
    for (const item of items) {
      const med = await Medicine.findByPk(item.medicineId, { transaction: t });
      if (!med) throw new AppError(400, `Obat dengan ID ${item.medicineId} tidak ditemukan`);
    }

    const orderNumber = await generateOrderNumber(t);

    const order = await Order.create({
      orderNumber,
      polyclinic,
      orderDate: orderDate || new Date(),
      notes,
      requestedBy,
      status: 'pending',
    }, { transaction: t });

    const orderItems = await OrderItem.bulkCreate(
      items.map(item => ({
        orderId: order.id,
        medicineId: item.medicineId,
        quantityRequested: item.quantityRequested,
        notes: item.notes || null,
      })),
      { transaction: t }
    );

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    });

    res.status(201).json({ success: true, message: 'Order berhasil dibuat', data: fullOrder });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PUT /api/orders/:id
exports.updateOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { transaction: t, lock: true });
    if (!order) throw new AppError(404, 'Order tidak ditemukan');
    if (order.status !== 'pending') throw new AppError(400, 'Hanya order berstatus pending yang dapat diedit');

    const { polyclinic, orderDate, notes, requestedBy, items } = req.body;

    await order.update({ polyclinic, orderDate, notes, requestedBy }, { transaction: t });

    if (items && items.length > 0) {
      await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
      for (const item of items) {
        const med = await Medicine.findByPk(item.medicineId, { transaction: t });
        if (!med) throw new AppError(400, `Obat dengan ID ${item.medicineId} tidak ditemukan`);
      }
      await OrderItem.bulkCreate(
        items.map(item => ({
          orderId: order.id,
          medicineId: item.medicineId,
          quantityRequested: item.quantityRequested,
          notes: item.notes || null,
        })),
        { transaction: t }
      );
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    });
    res.json({ success: true, message: 'Order berhasil diupdate', data: fullOrder });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PATCH /api/orders/:id/items — update quantity_approved (only when status=processing)
exports.updateOrderItems = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      transaction: t,
      lock: true,
    });
    if (!order) throw new AppError(404, 'Order tidak ditemukan');

    // Fetch items with medicine details separately under the transaction
    const itemsList = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Medicine, as: 'medicine' }],
      transaction: t,
    });
    order.items = itemsList;
    if (order.status !== 'processing') throw new AppError(400, 'Persetujuan jumlah hanya bisa dilakukan saat status processing');

    const { items } = req.body; // [{itemId, quantityApproved}]
    for (const update of items) {
      const item = order.items.find(i => i.id === update.itemId);
      if (!item) throw new AppError(400, `Item dengan ID ${update.itemId} tidak ditemukan dalam order ini`);
      if (update.quantityApproved > item.quantityRequested) {
        throw new AppError(400, `Jumlah yang disetujui tidak boleh melebihi jumlah yang diminta (${item.quantityRequested})`);
      }
      if (update.quantityApproved > item.medicine.stock) {
        throw new AppError(400, `Jumlah yang disetujui melebihi stok ${item.medicine.name} (stok: ${item.medicine.stock})`);
      }
      await item.update({ quantityApproved: update.quantityApproved }, { transaction: t });
    }

    await t.commit();

    const updatedOrder = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    });
    res.json({ success: true, message: 'Persetujuan jumlah berhasil disimpan', data: updatedOrder });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res, next) => {
  const t = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE });
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, {
      transaction: t,
      lock: true,
    });

    if (!order) throw new AppError(404, 'Order tidak ditemukan');

    // Fetch items with medicine details separately under the transaction
    const itemsList = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [{ model: Medicine, as: 'medicine' }],
      transaction: t,
    });
    order.items = itemsList;

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      throw new AppError(400, `Transisi status dari '${order.status}' ke '${status}' tidak diizinkan`);
    }

    // Stock deduction when completing
    if (status === 'completed') {
      for (const item of order.items) {
        const medicine = await Medicine.findByPk(item.medicineId, { transaction: t, lock: true });
        const approvedQty = item.quantityApproved ?? item.quantityRequested;

        if (medicine.stock < approvedQty) {
          throw new AppError(409, `Stok ${medicine.name} tidak cukup. Stok saat ini: ${medicine.stock}, dibutuhkan: ${approvedQty}`);
        }
        await medicine.update({ stock: medicine.stock - approvedQty }, { transaction: t });

        if (item.quantityApproved === null || item.quantityApproved === undefined) {
          await item.update({ quantityApproved: approvedQty }, { transaction: t });
        }
      }
    }

    await order.update({ status }, { transaction: t });
    await t.commit();

    const updated = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Medicine, as: 'medicine' }] }],
    });
    res.json({ success: true, message: `Status order berhasil diubah ke '${status}'`, data: updated });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

// DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) throw new AppError(404, 'Order tidak ditemukan');
    if (order.status !== 'pending') throw new AppError(400, 'Hanya order berstatus pending yang dapat dihapus. Gunakan fitur batalkan untuk order yang sudah diproses.');
    await order.destroy();
    res.json({ success: true, message: 'Order berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
