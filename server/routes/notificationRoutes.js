const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Minimal notifications API used by the client for unread count
// Returns { count: number } — currently returns 0 by default
router.get('/unread-count', protect, async (req, res) => {
  try {
    // TODO: wire real notification storage later. Return 0 for now.
    res.json({ count: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
