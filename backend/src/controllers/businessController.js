const { Business, Staff, Service, Appointment, User } = require('../models');

const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    return res.status(200).json(businesses);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'services' },
        { model: Staff, as: 'staff', attributes: ['id', 'name', 'specialization'] },
      ],
    });
    if (!business) return res.status(404).json({ message: 'Business not found.' });
    return res.status(200).json(business);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getBusinessServices = async (req, res) => {
  try {
    const services = await Service.findAll({ where: { business_id: req.params.id }, order: [['name', 'ASC']] });
    return res.status(200).json(services);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getBusinessStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({ where: { business_id: req.params.id }, attributes: ['id', 'name', 'specialization'], order: [['name', 'ASC']] });
    return res.status(200).json(staff);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getAllBusinessesAdmin = async (req, res) => {
  try {
    const businesses = await Business.findAll({ order: [['createdAt', 'DESC']] });
    const result = await Promise.all(businesses.map(async (b) => {
      const staffCount       = await Staff.count({ where: { business_id: b.id } });
      const serviceCount     = await Service.count({ where: { business_id: b.id } });
      const appointmentCount = await Appointment.count({ where: { business_id: b.id } });
      return { ...b.toJSON(), staffCount, serviceCount, appointmentCount };
    }));
    return res.status(200).json(result);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const createBusiness = async (req, res) => {
  try {
    const { name, category, address, phone, description, speciality, currency, adminEmail, adminPassword } = req.body;
    if (!name) return res.status(400).json({ message: 'Business name is required.' });
    const business = await Business.create({ name, category: category || 'Healthcare', address, phone, description, speciality, currency: currency || '₹' });
    if (adminEmail && adminPassword) {
      const existing = await User.findOne({ where: { email: adminEmail } });
      if (existing) return res.status(409).json({ message: 'Admin email already exists.' });
      await User.create({ email: adminEmail, password: adminPassword, role: 'ADMIN', business_id: business.id });
    }
    return res.status(201).json(business);
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found.' });
    await business.update(req.body);
    return res.status(200).json(business);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found.' });
    await business.destroy();
    return res.status(200).json({ message: 'Business deleted.' });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { getAllBusinesses, getBusinessById, getBusinessServices, getBusinessStaff, getAllBusinessesAdmin, createBusiness, updateBusiness, deleteBusiness };
