const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { validateRegister, validateLogin } = require('../middleware/validation');

// SECURITY: Generate URL-safe slug from organization name
// Prevents enumeration attacks by using predictable but non-guessable identifiers
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

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

      // SECURITY: Generate unique slug for secure clinic lookup
      // Prevents enumeration attacks via predictable naming
      let slug = generateSlug(organizationName);
      let slugExists = await Organization.findOne({ slug });
      let slugAttempts = 0;
      
      // SECURITY: Handle slug collisions by appending counter
      while (slugExists && slugAttempts < 100) {
        slugAttempts++;
        const newSlug = `${slug}-${slugAttempts}`;
        slugExists = await Organization.findOne({ slug: newSlug });
        if (!slugExists) slug = newSlug;
      }

      const organization = await Organization.create({
        name: organizationName,
        email: organizationEmail,
        phone: organizationPhone,
        slug,
        status: 'Pending', // SECURITY: New organizations start as Pending, awaiting system admin approval
        subscription: {
          plan: 'trial',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
          organizationSlug: slug,
          token: generateToken(user._id)
        });
      } else {
        res.status(400).json({ message: 'Invalid user data' });
      }
    } else {
      return res.status(400).json({ message: 'Organization details are required for registration' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // SECURITY: Organization slug passed via header to prevent enumeration
    const clinicSlug = req.headers['x-clinic-slug'];

    // Find user and populate organization with status field
    const user = await User.findOne({ username })
      .select('+password')
      .populate('organizationId', 'name status slug isActive');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // SECURITY: Verify clinic slug matches user's organization
    // This prevents users from logging into wrong organizations
    if (clinicSlug && user.organizationId?.slug !== clinicSlug) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // SECURITY: Check organization status for vetting workflow
    // Login blocked if organization is Pending or Suspended
    if (!user.organizationId) {
      return res.status(403).json({ message: 'No organization associated with this account' });
    }

    // SECURITY: Organization must be Approved to allow tenant access
    // 403 Forbidden for pending/suspended orgs (explicit status)
    if (user.organizationId.status !== 'Approved') {
      return res.status(403).json({ 
        message: 'Your clinic is awaiting system administrator approval. Please contact support.' 
      });
    }

    // Check if organization is active (additional layer for suspension)
    if (!user.organizationId.isActive) {
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
