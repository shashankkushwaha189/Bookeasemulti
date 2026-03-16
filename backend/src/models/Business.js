const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Business = sequelize.define('Business', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Healthcare',
  },
  address: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  speciality: { type: DataTypes.STRING, allowNull: true },
  currency: { type: DataTypes.STRING(10), defaultValue: '₹' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'businesses', timestamps: true });

module.exports = Business;
