const { User, Business, Appointment, bcrypt } = require('../models');

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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    if (user.role === 'SUPER_ADMIN' && req.user.id !== user.id) {
      return res.status(403).json({ message: 'Cannot modify other Super Admins.' });
    }
    
    const updateData = {};
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(409).json({ message: 'Email already exists.' });
      updateData.email = email;
    }
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (role && role !== user.role) {
      if (role === 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Cannot assign Super Admin role.' });
      }
      updateData.role = role;
    }
    
    await user.update(updateData);
    
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'email', 'role', 'business_id', 'createdAt'],
      include: [{ model: Business, as: 'business', attributes: ['name', 'category'] }]
    });
    
    return res.status(200).json(updatedUser);
  } catch (err) { 
    console.error(err); 
    return res.status(500).json({ message: 'Server error.' }); 
  }
};

module.exports = { getStats, getAllUsers, updateUser };
