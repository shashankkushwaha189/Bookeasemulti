const { User, Business, Appointment } = require('../models');

const getStats = async (req, res) => {
  try {
    const [businesses, customers, staff, appointments] = await Promise.all([
      Business.count(),
      User.count({ where: { role: 'CUSTOMER' } }),
      User.count({ where: { role: 'STAFF' } }),
      Appointment.count(),
    ]);
    return res.status(200).json({ businesses, customers, staff, appointments });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'business_id', 'createdAt'],
      include: [{ model: Business, as: 'business', attributes: ['name', 'category'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(users);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { getStats, getAllUsers };
