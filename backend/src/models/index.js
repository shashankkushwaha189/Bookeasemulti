const Business = require('./Business');
const User = require('./User');
const Staff = require('./Staff');
const Customer = require('./Customer');
const Service = require('./Service');
const Appointment = require('./Appointment');

Business.hasMany(Staff,       { foreignKey: 'business_id', as: 'staff' });
Business.hasMany(Service,     { foreignKey: 'business_id', as: 'services' });
Business.hasMany(Appointment, { foreignKey: 'business_id', as: 'appointments' });
Business.hasMany(User,        { foreignKey: 'business_id', as: 'users' });

User.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
User.hasOne(Staff,    { foreignKey: 'user_id', as: 'staffProfile' });
User.hasOne(Customer, { foreignKey: 'user_id', as: 'customerProfile' });

Staff.belongsTo(User,     { foreignKey: 'user_id',     as: 'user' });
Staff.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Staff.hasMany(Appointment,{ foreignKey: 'staff_id',    as: 'appointments' });

Customer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Customer.hasMany(Appointment, { foreignKey: 'customer_id', as: 'appointments' });

Service.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' });

Appointment.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Appointment.belongsTo(Staff,    { foreignKey: 'staff_id',    as: 'staff' });
Appointment.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Appointment.belongsTo(Service,  { foreignKey: 'service_id',  as: 'service' });

module.exports = { Business, User, Staff, Customer, Service, Appointment };
