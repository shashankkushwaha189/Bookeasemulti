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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    
    console.log('Update user request:', { id, email, role });
    
    const user = await User.findByPk(id);
    if (!user) {
      console.log('User not found for ID:', id);
      return res.status(404).json({ message: 'User not found.' });
    }
    
    if (user.role === 'SUPER_ADMIN' && req.user.id !== user.id) {
      console.log('Attempt to modify other Super Admin blocked');
      return res.status(403).json({ message: 'Cannot modify other Super Admins.' });
    }
    
    const updateData = {};
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        console.log('Email already exists:', email);
        return res.status(409).json({ message: 'Email already exists.' });
      }
      updateData.email = email;
      console.log('Email will be updated to:', email);
    }
    
    if (role && role !== user.role) {
      if (role === 'SUPER_ADMIN') {
        console.log('Attempt to assign Super Admin role blocked');
        return res.status(403).json({ message: 'Cannot assign Super Admin role.' });
      }
      updateData.role = role;
      console.log('Role will be updated to:', role);
    }
    
    console.log('Final update data:', updateData);
    
    await user.update(updateData);
    
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'email', 'role', 'business_id', 'createdAt'],
      include: [{ model: Business, as: 'business', attributes: ['name', 'category'] }]
    });
    
    console.log('User updated successfully:', updatedUser.email);
    return res.status(200).json(updatedUser);
  } catch (err) { 
    console.error('Error updating user:', err); 
    return res.status(500).json({ message: 'Server error.', error: err.message }); 
  }
};

module.exports = { getStats, getAllUsers, updateUser };
