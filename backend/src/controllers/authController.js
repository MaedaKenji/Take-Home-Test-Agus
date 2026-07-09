'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_super_secret';
const JWT_EXPIRES_IN = '8h';

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new AppError(400, 'Username dan password wajib diisi');
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError(401, 'Username atau password salah');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'Username atau password salah');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'displayName', 'createdAt'],
    });
    if (!user) throw new AppError(404, 'User tidak ditemukan');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
