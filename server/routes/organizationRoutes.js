const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

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
 * UPDATE user role (promote/demote)
 * Only admins can change user roles
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
 * GET public list of organizations (for login dropdown)
 * Returns only name and _id for security
 */
router.get('/public/list', async (req, res) => {
  try {
    // Only select the id and name fields to protect privacy/security
    const organizations = await Organization.find({}, 'name _id').sort({ name: 1 });
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching organizations' });
  }
});

module.exports = router;
