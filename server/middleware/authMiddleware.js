const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'dental_clinic_fallback_secret_key_for_development_only_32_chars_minimum';
      const decoded = jwt.verify(token, secret);
      
      // Get user with organization
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Verify organization is active
      const organization = await Organization.findById(req.user.organizationId);
      if (!organization || !organization.isActive) {
        return res.status(403).json({ message: 'Organization is not active' });
      }

      req.organizationId = req.user.organizationId;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
