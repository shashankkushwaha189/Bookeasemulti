const { Staff, User } = require('../models');

const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { business_id: req.user.business_id },
      include: [{ model: User, as: 'user', attributes: ['email'] }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json(staff);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const createStaff = async (req, res) => {
  try {
    const { name, specialization, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists.' });
    const user = await User.create({ email, password, role: 'STAFF', business_id: req.user.business_id, is_verified: true });
    const staff = await Staff.create({ user_id: user.id, business_id: req.user.business_id, name, specialization: specialization || '' });
    return res.status(201).json({ ...staff.toJSON(), user: { email: user.email } });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found.' });
    if (staff.business_id !== req.user.business_id) return res.status(403).json({ message: 'Access denied.' });
    await staff.update(req.body);
    return res.status(200).json(staff);
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff not found.' });
    if (staff.business_id !== req.user.business_id) return res.status(403).json({ message: 'Access denied.' });
    await User.destroy({ where: { id: staff.user_id } });
    await staff.destroy();
    return res.status(200).json({ message: 'Staff deleted.' });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { getAllStaff, createStaff, updateStaff, deleteStaff };
