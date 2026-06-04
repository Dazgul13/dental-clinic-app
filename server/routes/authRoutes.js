const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { validateRegister, validateLogin } = require('../middleware/validation');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '7d'
  });
};

router.post('/register', validateRegister, async (req, res) => {
  // SUPER ADMIN PROTECTION: Only allow registration with super admin secret
  const adminSecret = req.headers['x-super-admin-secret'];
  if (!adminSecret || adminSecret !== process.env.SUPER_ADMIN_MASTER_SECRET) {
    return res.status(403).json({ 
      message: 'Access denied. Only system administrators can provision new tenant organizations.' 
    });
  }

  try {
    const { username, email, password, organizationName, organizationEmail, organizationPhone } = req.body;

    // Check if user already exists with this email in any organization
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create organization and admin user for new clinic registration
    let organizationId;
    
    if (organizationName && organizationEmail && organizationPhone) {
      // Creating new organization with admin user
      const orgExists = await Organization.findOne({ email: organizationEmail });
      if (orgExists) {
        return res.status(400).json({ message: 'Organization with this email already exists' });
      }

      const organization = await Organization.create({
        name: organizationName,
        email: organizationEmail,
        phone: organizationPhone,
        subscription: {
          plan: 'trial',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        }
      });

      organizationId = organization._id;
      
      // Create admin user for the new organization
      const user = await User.create({
        organizationId,
        username,
        email,
        password,
        role: 'admin' // First user of new organization is always admin
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          token: generateToken(user._id)
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } else {
      // Regular user registration (without organization details) - creates staff user
      // In a real application, you might want to associate this with an existing organization
      // via invitation or other means. For now, we'll require organization details.
      return res.status(400).json({ message: 'Organization details are required for registration' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select('+password').populate('organizationId', 'name isActive');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if organization is active
    if (!user.organizationId || !user.organizationId.isActive) {
      return res.status(403).json({ message: 'Organization is not active' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        message: 'Account temporarily locked due to multiple failed login attempts. Try again later.' 
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts for 15 minutes
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();
        return res.status(423).json({ 
          message: 'Account locked due to multiple failed login attempts. Try again in 15 minutes.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId._id,
      organizationName: user.organizationId.name,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
