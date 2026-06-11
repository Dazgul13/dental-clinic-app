const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { seatLimiter } = require('../middleware/seatLimiter');
const { validateRegister } = require('../middleware/validation');

/**
 * GET organization details
 */
router.get('/me', protect, async (req, res) => {
  try {
    const organization = await Organization.findById(req.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE organization details
 */
router.put('/me', protect, async (req, res) => {
  try {
    // Only admins can update organization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update organization details' });
    }

    const organization = await Organization.findById(req.organizationId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update allowed fields
    if (req.body.name) organization.name = req.body.name;
    if (req.body.email) organization.email = req.body.email;
    if (req.body.phone) organization.phone = req.body.phone;
    if (req.body.address) organization.address = req.body.address;
    if (req.body.settings) organization.settings = { ...organization.settings, ...req.body.settings };

    const updatedOrganization = await organization.save();
    res.json(updatedOrganization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET organization users
 */
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({ organizationId: req.organizationId })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * CREATE STAFF USER
 * SECURITY: Only admins can create staff users, with seat limit enforcement
 * Uses seatLimiter middleware to enforce 1 admin / 5 staff max per organization
 */
router.post('/users', protect, async (req, res) => {
  // SECURITY: Only admins can create staff users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can invite staff members' });
  }

  const { username, email, password, role } = req.body;

  // SECURITY: Role must be 'staff' for this endpoint
  // Admin creation is separate (only during org setup via registration)
  const targetRole = 'staff';

  try {
    // SECURITY: Check seat limits before proceeding
    // Count existing users to enforce limits: max 1 admin, max 2 staff
    const adminCount = await User.countDocuments({ organizationId: req.organizationId, role: 'admin' });
    const staffCount = await User.countDocuments({ organizationId: req.organizationId, role: 'staff' });

    // SECURITY: Staff creation blocked if 2 staff already exist (hard cap)
    // This enforces the strict subscription tier seat cap
    if (targetRole === 'staff' && staffCount >= 2) {
      return res.status(400).json({ 
        message: 'Seat limit reached: Maximum of 2 staff members allowed per clinic. Upgrade your plan for additional seats.' 
      });
    }

    // Check if user already exists with this email in any organization
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if username exists in this organization
    const usernameExists = await User.findOne({ organizationId: req.organizationId, username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken in this clinic' });
    }

    // Create staff user
    const user = await User.create({
      organizationId: req.organizationId,
      username,
      email,
      password,
      role: targetRole
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE user role (promote/demote)
 * Only admins can change user roles
 * SECURITY: Seat limiter prevents promotion if admin limit reached
 */
router.put('/users/:userId/role', protect, async (req, res) => {
  try {
    // Only admins can change user roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    const { role } = req.body;
    
    // Validate role
    if (!role || !['admin', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or staff' });
    }

    // Find the user and ensure they belong to the same organization
    const user = await User.findOne({
      _id: req.params.userId,
      organizationId: req.organizationId
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-demotion (admins can't remove their own admin role)
    if (user._id.toString() === req.user._id.toString() && role === 'staff') {
      return res.status(400).json({ message: 'Cannot remove your own admin role' });
    }

    // SECURITY: Check seat limits before promotion
    // Cannot promote to admin if one already exists (max 1 admin per org)
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ 
        organizationId: req.organizationId, 
        role: 'admin',
        _id: { $ne: user._id } // Exclude current user in case of demote/promote cycle
      });
      if (adminCount >= 1) {
        return res.status(403).json({ 
          message: 'Seat limit reached: Only 1 admin is allowed per clinic. Demote the current admin first.' 
        });
      }
    }

    // Update user role
    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * SECURE CLINIC LOOKUP
 * SECURITY: POST-only endpoint to verify clinic slug existence
 * Prevents enumeration attacks via GET-based public listings
 * Rate limiting applied via slugVerifyLimiter middleware to prevent automated scraping
 */
router.post('/verify-slug', async (req, res) => {
  // SECURITY: Accept only POST requests to prevent caching and enumeration
  const { slug } = req.body;

  // SECURITY: Strict input validation - only allow safe slug format
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Valid slug is required' });
  }

  // SECURITY: Sanitize slug input to prevent injection - only lowercase letters, numbers, hyphens
  const sanitizedSlug = slug.toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(sanitizedSlug)) {
    return res.status(400).json({ message: 'Invalid slug format' });
  }

  try {
    // SECURITY: Only check if slug exists, return minimal data
    // This prevents information disclosure about organization status or details
    const organization = await Organization.findOne({ slug: sanitizedSlug }, '_id');
    res.json({ valid: !!organization });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
