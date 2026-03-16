const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  business_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'businesses', key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'services', timestamps: true });

module.exports = Service;
