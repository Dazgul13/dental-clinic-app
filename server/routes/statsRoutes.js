const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// GET aggregated stats for dashboard
router.get('/', protect, async (req, res) => {
  try {
    // total patients for the organization
    const totalPatients = await Patient.countDocuments({ organizationId: req.organizationId });

    // pending treatment plans across patients
    const patients = await Patient.find({ organizationId: req.organizationId }, 'treatmentPlans');
    let pendingPlans = 0;
    patients.forEach(p => {
      if (Array.isArray(p.treatmentPlans)) {
        pendingPlans += p.treatmentPlans.filter(tp => tp.status === 'Proposed' || tp.status === 'pending').length;
      }
    });

    // today's appointments count
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaysAppointments = await Appointment.countDocuments({
      organizationId: req.organizationId,
      date: { $gte: todayStart, $lt: todayEnd }
    });

    res.json({ totalPatients, pendingPlans, todaysAppointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
