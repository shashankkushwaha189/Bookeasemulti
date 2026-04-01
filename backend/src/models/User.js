const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: true },
  auth_provider: { type: DataTypes.STRING, allowNull: false, defaultValue: 'local' },
  google_id: { type: DataTypes.STRING, allowNull: true, unique: true },
  is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  otp: { type: DataTypes.STRING, allowNull: true },
  otp_expires_at: { type: DataTypes.DATE, allowNull: true },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'),
    allowNull: false,
    defaultValue: 'CUSTOMER',
  },
  business_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'businesses', key: 'id' } },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => { if (user.password) user.password = await bcrypt.hash(user.password, 10); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10); },
  },
});

User.prototype.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = User;
