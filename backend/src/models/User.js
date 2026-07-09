'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff'),
    allowNull: false,
    defaultValue: 'staff',
  },
  displayName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'display_name',
  },
}, {
  tableName: 'users',
  underscored: true,
});

module.exports = User;
