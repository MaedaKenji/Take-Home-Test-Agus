'use strict';
const { Op } = require('sequelize');
const { Medicine } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/medicines
exports.getMedicines = async (req, res, next) => {
  try {
    const { search, category, status, lowStock } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where.category = category;
    if (status) {
      if (status === 'Tersedia') {
        where.stock = { [Op.gt]: Medicine.sequelize.col('min_stock') };
      } else if (status === 'Rendah') {
        where.stock = {
          [Op.and]: [
            { [Op.gt]: 0 },
            { [Op.lte]: Medicine.sequelize.col('min_stock') }
          ]
        };
      } else if (status === 'Habis') {
        where.stock = 0;
      }
    } else if (lowStock === 'true') {
      where[Op.and] = [
        { stock: { [Op.lte]: Medicine.sequelize.col('min_stock') } }
      ];
    }
    const medicines = await Medicine.findAll({ where, order: [['name', 'ASC']] });
    res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines/low-stock
exports.getLowStockMedicines = async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const medicines = await Medicine.findAll({
      where: sequelize.where(
        sequelize.col('stock'),
        { [Op.lte]: sequelize.col('min_stock') }
      ),
      order: [['stock', 'ASC']],
    });
    res.json({ success: true, data: medicines });
  } catch (err) {
    next(err);
  }
};

// GET /api/medicines/:id
exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) throw new AppError(404, 'Obat tidak ditemukan');
    res.json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// POST /api/medicines
exports.createMedicine = async (req, res, next) => {
  try {
    const { code, name, unit, stock, minStock, category } = req.body;
    const medicine = await Medicine.create({ code, name, unit, stock, minStock, category });
    res.status(201).json({ success: true, message: 'Obat berhasil ditambahkan', data: medicine });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError(400, 'Kode obat sudah digunakan'));
    }
    next(err);
  }
};

// PUT /api/medicines/:id
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) throw new AppError(404, 'Obat tidak ditemukan');
    const { code, name, unit, stock, minStock, category } = req.body;
    await medicine.update({ code, name, unit, stock, minStock, category });
    res.json({ success: true, message: 'Obat berhasil diupdate', data: medicine });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return next(new AppError(400, 'Kode obat sudah digunakan'));
    }
    next(err);
  }
};

// DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) throw new AppError(404, 'Obat tidak ditemukan');
    await medicine.destroy();
    res.json({ success: true, message: 'Obat berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
