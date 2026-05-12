const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { protect } = require('../middleware/authMiddleware');
const { 
  validatePatient, 
  validateNote, 
  validateMongoId, 
  validateNoteParams,
  validateSearch 
} = require('../middleware/validation');

router.get('/', protect, validateSearch, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { organizationId: req.organizationId };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    }).populate('clinicalNotes.dentist', 'username');
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, validatePatient, async (req, res) => {
  try {
    const { firstName, lastName, dob, phone, email, address, medicalHistory } = req.body;

    const patient = await Patient.create({
      organizationId: req.organizationId,
      firstName,
      lastName,
      dob,
      phone,
      email,
      address,
      medicalHistory: medicalHistory || { allergies: [], conditions: [] }
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, validateMongoId, validatePatient, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    });

    if (patient) {
      patient.firstName = req.body.firstName || patient.firstName;
      patient.lastName = req.body.lastName || patient.lastName;
      patient.dob = req.body.dob || patient.dob;
      patient.phone = req.body.phone || patient.phone;
      patient.email = req.body.email || patient.email;
      patient.address = req.body.address || patient.address;
      patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;

      const updatedPatient = await patient.save();
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/notes', protect, validateMongoId, validateNote, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    });

    if (patient) {
      const note = {
        note: req.body.text,
        dentist: req.user._id,
        date: new Date()
      };

      patient.clinicalNotes.push(note);
      await patient.save();

      const updatedPatient = await Patient.findById(req.params.id)
        .populate('clinicalNotes.dentist', 'username');
      res.status(201).json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE clinical note
 */
router.put('/:patientId/notes/:noteId', protect, validateNoteParams, validateNote, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const note = patient.clinicalNotes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.note = req.body.text;
    await patient.save();

    const updated = await Patient.findById(req.params.patientId)
      .populate('clinicalNotes.dentist', 'username');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE clinical note
 */
router.delete('/:patientId/notes/:noteId', protect, validateNoteParams, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const note = patient.clinicalNotes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.deleteOne();
    await patient.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * DELETE patient
 */
router.delete('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await patient.deleteOne();
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * UPDATE dental chart tooth
 */
router.put('/:patientId/dental-chart/:toothNumber', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const toothNumber = parseInt(req.params.toothNumber);
    if (toothNumber < 1 || toothNumber > 32) {
      return res.status(400).json({ message: 'Invalid tooth number. Must be between 1 and 32.' });
    }

    // Initialize dental chart if it doesn't exist
    if (!patient.dentalChart) {
      patient.dentalChart = { teeth: [] };
    }

    // Find existing tooth or create new entry
    let tooth = patient.dentalChart.teeth.find(t => t.number === toothNumber);
    
    if (tooth) {
      tooth.status = req.body.status || tooth.status;
      tooth.notes = req.body.notes !== undefined ? req.body.notes : tooth.notes;
      
      // Update surfaces if provided
      if (req.body.surfaces) {
        tooth.surfaces = {
          mesial: req.body.surfaces.mesial || tooth.surfaces?.mesial || { status: 'healthy', notes: '' },
          occlusal: req.body.surfaces.occlusal || tooth.surfaces?.occlusal || { status: 'healthy', notes: '' },
          distal: req.body.surfaces.distal || tooth.surfaces?.distal || { status: 'healthy', notes: '' },
          buccal: req.body.surfaces.buccal || tooth.surfaces?.buccal || { status: 'healthy', notes: '' },
          lingual: req.body.surfaces.lingual || tooth.surfaces?.lingual || { status: 'healthy', notes: '' },
          incisal: req.body.surfaces.incisal || tooth.surfaces?.incisal || { status: 'healthy', notes: '' }
        };
      }
      
      tooth.lastUpdated = new Date();
    } else {
      patient.dentalChart.teeth.push({
        number: toothNumber,
        status: req.body.status || 'healthy',
        surfaces: req.body.surfaces || {
          mesial: { status: 'healthy', notes: '' },
          occlusal: { status: 'healthy', notes: '' },
          distal: { status: 'healthy', notes: '' },
          buccal: { status: 'healthy', notes: '' },
          lingual: { status: 'healthy', notes: '' },
          incisal: { status: 'healthy', notes: '' }
        },
        notes: req.body.notes || '',
        lastUpdated: new Date()
      });
    }

    await patient.save();

    const updatedPatient = await Patient.findById(req.params.patientId)
      .populate('clinicalNotes.dentist', 'username');

    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
