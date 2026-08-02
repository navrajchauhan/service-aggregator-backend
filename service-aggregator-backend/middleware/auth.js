const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Middleware to check if user is a provider
const isProvider = (req, res, next) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Access denied. Providers only.' });
  }
  next();
};

module.exports = { auth, isProvider };