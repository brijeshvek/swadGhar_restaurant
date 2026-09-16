const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const mockStore = require('../utils/mockStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Protect routes - Verifies JWT Bearer Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'swadghar_super_secure_jwt_secret_key_2026_dev_prod'
    );

    let user = null;

    if (isDbConnected()) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      user = mockStore.users.find(u => u._id === decoded.id || u.email === decoded.email) || {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'SwadGhar User',
        email: decoded.email || 'user@swadghar.com',
        role: decoded.role || 'customer',
        isBlocked: false,
      };
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};

// Optional auth
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'swadghar_super_secure_jwt_secret_key_2026_dev_prod'
      );
      let user = null;
      if (isDbConnected()) {
        user = await User.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = mockStore.users.find(u => u._id === decoded.id || u.email === decoded.email);
      }
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token errors in optionalAuth
    }
  }
  next();
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying role permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
};
