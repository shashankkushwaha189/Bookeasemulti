const { Appointment, Staff, Customer, Service, Business } = require('../models');

const include = [
  { model: Staff,    as: 'staff',    attributes: ['id', 'name', 'specialization'] },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'phone'] },
  { model: Service,  as: 'service',  attributes: ['id', 'name', 'duration_minutes', 'price'] },
  { model: Business, as: 'business', attributes: ['id', 'name', 'category', 'currency'] },
];

const getBusinessAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { business_id: req.user.business_id },
      include,
      order: [['appointment_date', 'DESC'], ['appointment_time', 'ASC']],
    });
    return res.status(200).json(appointments);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const getStaffAppointments = async (req, res) => {
  try {
    const staff = await Staff.findOne({ where: { user_id: req.user.id } });
    if (!staff) return res.status(404).json({ message: 'Staff profile not found.' });
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.findAll({
      where: { staff_id: staff.id },
      include,
      order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
    });
    return res.status(200).json({ appointments, today });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getMyAppointments = async (req, res) => {
  try {
    const customer = await Customer.findOne({ where: { user_id: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });
    const appointments = await Appointment.findAll({
      where: { customer_id: customer.id },
      include,
      order: [['appointment_date', 'DESC'], ['appointment_time', 'ASC']],
    });
    return res.status(200).json(appointments);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const createAppointment = async (req, res) => {
  try {
    const { business_id, service_id, staff_id, appointment_date, appointment_time, notes } = req.body;
    if (!business_id || !service_id || !staff_id || !appointment_date || !appointment_time)
      return res.status(400).json({ message: 'All fields are required.' });
    const customer = await Customer.findOne({ where: { user_id: req.user.id } });
    if (!customer) return res.status(404).json({ message: 'Customer profile not found.' });
    const service = await Service.findOne({ where: { id: service_id, business_id } });
    if (!service) return res.status(400).json({ message: 'Invalid service for this business.' });
    const staff = await Staff.findOne({ where: { id: staff_id, business_id } });
    if (!staff) return res.status(400).json({ message: 'Invalid staff for this business.' });
    const appointment = await Appointment.create({
      business_id, service_id, staff_id, customer_id: customer.id,
      appointment_date, appointment_time, notes, status: 'BOOKED',
    });
    const full = await Appointment.findByPk(appointment.id, { include });
    return res.status(201).json(full);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    if (req.user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ where: { user_id: req.user.id } });
      if (appointment.customer_id !== customer.id) return res.status(403).json({ message: 'Access denied.' });
      if (req.body.status && req.body.status !== 'CANCELLED')
        return res.status(403).json({ message: 'Customers can only cancel.' });
    }
    if (req.user.role === 'ADMIN' && appointment.business_id !== req.user.business_id)
      return res.status(403).json({ message: 'Access denied.' });
    await appointment.update(req.body);
    const updated = await Appointment.findByPk(appointment.id, { include });
    return res.status(200).json(updated);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ include, order: [['appointment_date', 'DESC']] });
    return res.status(200).json(appointments);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { getBusinessAppointments, getStaffAppointments, getMyAppointments, createAppointment, updateAppointment, getAllAppointments };
