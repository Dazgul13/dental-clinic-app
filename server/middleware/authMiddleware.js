const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Server configuration error' });
      }
      const decoded = jwt.verify(token, secret);

      // Get user with organization
      req.user = await User.findById(decoded.id).select('-password').populate('organizationId', 'name status isActive');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // SECURITY: Verify organization status - block login if Pending or Suspended
      // This enforces the administrative approval workflow
      const organization = req.user.organizationId;
      if (!organization) {
        return res.status(403).json({ message: 'No organization associated with this account' });
      }

      // Check organization status for vetting workflow
      // Status must be 'Approved' for tenant users to access the platform
      if (organization.status !== 'Approved') {
        return res.status(403).json({ 
          message: 'Your clinic is awaiting system administrator approval. Please contact support.' 
        });
      }

      // Verify organization is active (additional layer for suspension)
      if (!organization.isActive) {
        return res.status(403).json({ message: 'Organization is not active' });
      }

      req.organizationId = req.user.organizationId._id;
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
