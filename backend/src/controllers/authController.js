const jwt = require('jsonwebtoken');
const { User, Staff, Customer, Business } = require('../models');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, business_id: user.business_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required.' });
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });
    const user = await User.create({ email, password, role: 'CUSTOMER' });
    await Customer.create({ user_id: user.id, name, phone: phone || '' });
    const token = generateToken(user);
    return res.status(201).json({ message: 'Registration successful.', token, user: { id: user.id, email: user.email, role: user.role, name } });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    let name = email;
    let businessName = null;
    let businessCategory = null;

    if (user.role === 'STAFF') {
      const staff = await Staff.findOne({ where: { user_id: user.id } });
      if (staff) name = staff.name;
    } else if (user.role === 'CUSTOMER') {
      const customer = await Customer.findOne({ where: { user_id: user.id } });
      if (customer) name = customer.name;
    }

    if (user.business_id) {
      const business = await Business.findByPk(user.business_id);
      if (business) { businessName = business.name; businessCategory = business.category; }
    }

    const token = generateToken(user);
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, name, business_id: user.business_id, businessName, businessCategory },
    });
  } catch (err) { console.error(err); return res.status(500).json({ message: 'Server error.' }); }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'STAFF') profile = await Staff.findOne({ where: { user_id: user.id } });
    else if (user.role === 'CUSTOMER') profile = await Customer.findOne({ where: { user_id: user.id } });
    return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role, business_id: user.business_id }, profile });
  } catch { return res.status(500).json({ message: 'Server error.' }); }
};

module.exports = { register, login, getMe };
