const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  business_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'businesses', key: 'id' } },
  service_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'services', key: 'id' } },
  staff_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'staff', key: 'id' } },
  customer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' } },
  appointment_date: { type: DataTypes.DATEONLY, allowNull: false },
  appointment_time: { type: DataTypes.TIME, allowNull: false },
  status: {
    type: DataTypes.ENUM('BOOKED', 'COMPLETED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'BOOKED',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'appointments', timestamps: true });

module.exports = Appointment;
