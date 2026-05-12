const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');
const { validateAppointment, validateMongoId } = require('../middleware/validation');

/**
 * GET all appointments (filter by date/status)
 */
router.get('/', protect, async (req, res) => {
  try {
    const { date, startDate, endDate, status } = req.query;
    let query = { organizationId: req.organizationId };

    if (startDate && endDate) {
      // Date range query for week view
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include the end date
      query.date = { $gte: start, $lt: end };
    } else if (date) {
      // Single date query
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
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
 */
router.post('/', protect, validateAppointment, async (req, res) => {
  try {
    const { patientId, dentistId, date, status, notes } = req.body;

    const appointment = await Appointment.create({
      organizationId: req.organizationId,
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
 * Editable:
 * - date
 * - status
 * - dentistId
 * - notes
 */
router.put('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Editable fields
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
router.get('/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    const appointments = await Appointment.find({
      organizationId: req.organizationId,
      date: {
        $gte: now,
        $lte: threeDaysLater
      }
    })
      .populate('patientId', 'firstName lastName phone email')
      .populate('dentistId', 'username')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
