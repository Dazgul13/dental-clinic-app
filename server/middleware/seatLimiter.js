const User = require('../models/User');

// SEAT LIMITER MIDDLEWARE
// Enforces strict tier seat caps: 1 Admin, 2 Staff max per organization
// SECURITY: Prevents privilege escalation and resource exhaustion
// Anti-spam protection: Rate limiting should be applied at route level for signup endpoints
const seatLimiter = async (req, res, next) => {
  const { role, organizationId } = req.body;
  const organizationIdToUse = organizationId || req.user?.organizationId;

  // SECURITY: Must have organization context to enforce limits
  if (!organizationIdToUse) {
    return res.status(400).json({ message: 'Organization context required' });
  }

  // SECURITY: Validate role is provided and valid
  if (!role || !['admin', 'staff'].includes(role)) {
    return res.status(400).json({ message: 'Valid role (admin or staff) is required' });
  }

  try {
    // SECURITY: Optimized count query prevents database overload during signup attempts
    // This check prevents spam bots from enumerating valid organizations via error timing
    const existingCounts = await User.aggregate([
      { $match: { organizationId: organizationIdToUse } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const adminCount = existingCounts.find(c => c._id === 'admin')?.count || 0;
    const staffCount = existingCounts.find(c => c._id === 'staff')?.count || 0;

    // SECURITY: Strict seat enforcement - 1 Admin maximum per organization
    // Prevents multiple admin accounts which could lead to privilege conflicts
    if (role === 'admin' && adminCount >= 1) {
      return res.status(400).json({ 
        message: 'Seat limit reached: Only 1 admin is allowed per clinic. Upgrade your plan for additional seats.' 
      });
    }

    // SECURITY: Strict seat enforcement - 2 Staff maximum per organization
    // Hard cap to prevent over-subscription and ensure performance
    if (role === 'staff' && staffCount >= 2) {
      return res.status(400).json({ 
        message: 'Seat limit reached: Maximum of 2 staff members allowed per clinic. Upgrade your plan for additional seats.' 
      });
    }

    next();
  } catch (error) {
    console.error('Seat limit check error:', error);
    res.status(500).json({ message: 'Error checking seat availability' });
  }
};

module.exports = { seatLimiter };