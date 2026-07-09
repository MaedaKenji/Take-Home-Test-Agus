'use strict';
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_super_secret';

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Attaches decoded user payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token autentikasi diperlukan'));
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Token telah kedaluwarsa, silakan login kembali'));
    }
    return next(new AppError(401, 'Token tidak valid'));
  }
};

module.exports = { authenticate };
