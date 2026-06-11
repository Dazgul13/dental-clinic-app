const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');
const { validateAppointment, validateMongoId } = require('../middleware/validation');

/**
 * GET all appointments (filter by date/status)
 * SECURITY: RLAC middleware automatically filters by createdBy for staff users
 */
router.get('/', protect, async (req, res) => {
  try {
    const { date, startDate, endDate, status } = req.query;
    let query = { organizationId: req.organizationId };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    // SECURITY: Pass user context for RLAC filtering in pre-find hook
    const appointments = await Appointment.find(query, null, { userContext: { role: req.user.role, userId: req.user._id } })
      .populate('patientId', 'firstName lastName phone email')
      .populate('dentistId', 'username')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * CREATE appointment
 * SECURITY: Sets createdBy to the authenticated user for RLAC tracking
 */
router.post('/', protect, validateAppointment, async (req, res) => {
  try {
    const { patientId, dentistId, date, status, notes } = req.body;

    // SECURITY: createdBy is set to the authenticated user ID
    // This enables Row-Level Access Control (RLAC) for data segregation
    const appointment = await Appointment.create({
      organizationId: req.organizationId,
      createdBy: req.user._id,
      patientId,
      dentistId,
      date,
      status: status || 'scheduled',
      notes: notes || ''
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'firstName lastName phone email')
      .populate('dentistId', 'username');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE appointment
 * SECURITY: RLAC ensures staff can only update appointments they created
 */
router.put('/:id', protect, validateMongoId, async (req, res) => {
  try {
    // SECURITY: Pass user context for RLAC filtering in pre-findOne hook
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    }, null, { userContext: { role: req.user.role, userId: req.user._id } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (req.body.date) appointment.date = req.body.date;
    if (req.body.status) appointment.status = req.body.status;
    if (req.body.dentistId) appointment.dentistId = req.body.dentistId;
    if (req.body.notes !== undefined) appointment.notes = req.body.notes;

    const updatedAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(updatedAppointment._id)
      .populate('patientId', 'firstName lastName phone email')
      .populate('dentistId', 'username');

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE appointment
 */
router.delete('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await appointment.deleteOne();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET UPCOMING APPOINTMENTS (NOW → NEXT 3 DAYS)
// SECURITY: RLAC middleware automatically filters by createdBy for staff users
router.get('/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // SECURITY: Pass user context for RLAC filtering in pre-find hook
    const appointments = await Appointment.find({
      organizationId: req.organizationId,
      date: {
        $gte: now,
        $lte: threeDaysLater
      }
    }, null, { userContext: { role: req.user.role, userId: req.user._id } })
      .populate('patientId', 'firstName lastName phone email')
      .populate('dentistId', 'username')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
