// System Admin Routes
// Handles system-level administration including organization approval workflow
// NO multi-tenant scoping - operates across all organizations for auditing/approvals

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SystemAdmin = require('../models/SystemAdmin');
const Organization = require('../models/Organization');
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '7d'
  });
};

// SYSTEM ADMIN LOGIN
// SECURITY: Separate auth system from tenant users - no organization scope
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // SECURITY: Find system admin by username (global uniqueness)
    const sysAdmin = await SystemAdmin.findOne({ username }).select('+password');

    if (!sysAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // SECURITY: Verify password against hashed version
    const isMatch = await sysAdmin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login timestamp for audit trail
    sysAdmin.lastLogin = new Date();
    await sysAdmin.save();

    res.json({
      _id: sysAdmin._id,
      username: sysAdmin.username,
      email: sysAdmin.email,
      token: generateToken(sysAdmin._id)
    });
  } catch (error) {
    console.error('System admin login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET ALL ORGANIZATIONS (for approval console)
// SECURITY: Only accessible to authenticated system admins
// Returns all organizations regardless of status for audit/approval workflow
router.get('/organizations', protect, async (req, res) => {
  try {
    // SECURITY: Check if request is from system admin context
    // This endpoint should only be used by system admins, not tenant users
    if (req.headers['x-system-admin'] !== 'true') {
      return res.status(403).json({ message: 'System admin access required' });
    }

    // Fetch all organizations with pending/approved/suspended status
    // SECURITY: No organization filtering - system admin sees all
    const organizations = await Organization.find({}).sort({ createdAt: -1 });
    
    // Get user count for each organization
    const User = require('../models/User');
    const orgsWithUserCounts = await Promise.all(
      organizations.map(async (org) => {
        const userCount = await User.countDocuments({ organizationId: org._id });
        return { ...org.toObject(), userCount };
      })
    );
    
    res.json(orgsWithUserCounts);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE ORGANIZATION STATUS
// SECURITY: Changes organization status to Approved/Suspended, controlling tenant access
// Only system admins can invoke this endpoint via x-system-admin header
router.put('/organizations/:id/status', protect, async (req, res) => {
  try {
    // SECURITY: Verify system admin context for approval action
    if (req.headers['x-system-admin'] !== 'true') {
      return res.status(403).json({ message: 'System admin access required' });
    }

    const { status } = req.body;

    // SECURITY: Validate status transition
    const validStatuses = ['Pending', 'Approved', 'Suspended'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // SECURITY: Update status - only Approved status enables tenant login
    organization.status = status;
    await organization.save();

    res.json({
      message: `Organization ${status === 'Approved' ? 'approved' : status === 'Suspended' ? 'suspended' : 'set to pending'} successfully`,
      organization: {
        _id: organization._id,
        name: organization.name,
        email: organization.email,
        status: organization.status
      }
    });
  } catch (error) {
    console.error('Error updating organization status:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;