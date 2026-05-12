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

module.exports = router;
