'use strict';
const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const AppError = require('../utils/AppError');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) throw new AppError(400, 'Nama kategori wajib diisi');
    const [category, created] = await Category.findOrCreate({
      where: { name: name.trim() },
      defaults: { name: name.trim() },
    });
    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Kategori berhasil ditambahkan' : 'Kategori sudah ada',
      data: category,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:name
router.delete('/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const deletedCount = await Category.destroy({ where: { name } });
    if (!deletedCount) throw new AppError(404, 'Kategori tidak ditemukan');
    res.json({ success: true, message: `Kategori "${name}" berhasil dihapus` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
