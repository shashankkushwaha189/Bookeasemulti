const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
  next();
};

const businessScope = (req, res, next) => {
  if (req.user.role === 'ADMIN' && !req.user.business_id)
    return res.status(403).json({ message: 'Admin has no business assigned.' });
  next();
};

module.exports = { authenticate, authorize, businessScope };
