// Patient Routes
// Handles all patient-related API endpoints with multi-tenant organization scoping

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

// GET all patients with optional search filter
// SECURITY: RLAC middleware automatically filters by createdBy for staff users
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

    // SECURITY: RLAC query middleware automatically appends createdBy filter for staff
    // Pass user context through query options for the pre-find hook
    const patients = await Patient.find(query, null, { userContext: { role: req.user.role, userId: req.user._id } }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single patient by ID with populated clinical notes
// SECURITY: RLAC middleware automatically filters by createdBy for staff users
router.get('/:id', protect, validateMongoId, async (req, res) => {
  try {
    // SECURITY: Pass user context for RLAC filtering in pre-findOne hook
    const patient = await Patient.findOne({ 
      _id: req.params.id, 
      organizationId: req.organizationId 
    }, null, { userContext: { role: req.user.role, userId: req.user._id } })
      .populate('clinicalNotes.dentist', 'username');
    
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE new patient
// SECURITY: Sets createdBy to the authenticated user for RLAC tracking
// Staff can only create patients; createdBy ensures ownership for row-level filtering
router.post('/', protect, validatePatient, async (req, res) => {
  try {
    const { firstName, lastName, dob, phone, email, address, medicalHistory } = req.body;

    // SECURITY: createdBy is set to the authenticated user ID
    // This enables Row-Level Access Control (RLAC) for data segregation
    const patient = await Patient.create({
      organizationId: req.organizationId,
      createdBy: req.user._id,
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

// UPDATE patient information
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

// ADD clinical note to patient
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

// UPDATE clinical note - modifies existing note text
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

// DELETE clinical note - Fixed to use pull() instead of deleteOne() on subdocument
router.delete('/:patientId/notes/:noteId', protect, validateNoteParams, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Remove the note using pull() - correct method for removing subdocuments from array
    patient.clinicalNotes.pull(req.params.noteId);
    await patient.save();

    // Return updated patient with populated dentist info
    const updatedPatient = await Patient.findById(req.params.patientId)
      .populate('clinicalNotes.dentist', 'username');
    res.json(updatedPatient);
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE patient - removes patient and all associated data
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

// CREATE treatment plan - adds a new treatment plan to patient
router.post('/:patientId/treatment-plans', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.patientId,
      organizationId: req.organizationId
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const { toothNumber, surface, procedure, cost } = req.body;

    if (!procedure) {
      return res.status(400).json({ message: 'Procedure is required' });
    }

    const newPlan = {
      toothNumber: toothNumber || null,
      surface: surface || null,
      procedure,
      cost: cost || null,
      status: 'Proposed',
      createdAt: new Date()
    };

    patient.treatmentPlans.push(newPlan);
    await patient.save();

    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE treatment plan status - modifies proposal lifecycle
router.patch('/:patientId/treatment-plans/:planId', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find the treatment plan by ID in the array
    const planIndex = patient.treatmentPlans.findIndex(plan => plan._id.toString() === req.params.planId);
    if (planIndex === -1) {
      return res.status(404).json({ message: 'Treatment plan not found' });
    }

    // Update the status
    patient.treatmentPlans[planIndex].status = req.body.status || patient.treatmentPlans[planIndex].status;

    await patient.save();

    res.json(patient);
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE dental chart tooth - supports both permanent (1-32) and primary (A-T) teeth
router.put('/:patientId/dental-chart/:toothNumber', protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      _id: req.params.patientId, 
      organizationId: req.organizationId 
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Support both numeric (1-32 permanent) and letter (A-T primary) tooth numbers
    let toothNumber = req.params.toothNumber;
    
    // If it's a numeric string, convert to number for comparison
    const isNumericTooth = !isNaN(toothNumber);
    const toothNumForComparison = isNumericTooth ? parseInt(toothNumber) : toothNumber;
    
    // Validate tooth number - either numeric (1-32) or letter (A-T, case-insensitive)
    const validNumericTeeth = toothNumForComparison >= 1 && toothNumForComparison <= 32;
    const validLetterTeeth = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T']
      .includes(toothNumber.toUpperCase());
    
    if (!validNumericTeeth && !validLetterTeeth) {
      return res.status(400).json({ message: 'Invalid tooth number. Use numbers 1-32 for permanent teeth or A-T for primary teeth.' });
    }
    
    // Use uppercase for letter teeth to ensure consistent storage
    const normalizedToothNumber = isNumericTooth ? toothNumForComparison : toothNumber.toUpperCase();
    
    // Initialize dental chart if it doesn't exist
    if (!patient.dentalChart) {
      patient.dentalChart = { teeth: [] };
    }

    // Find existing tooth or create new entry
    let tooth = patient.dentalChart.teeth.find(t => t.number === normalizedToothNumber);
    
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
        number: normalizedToothNumber,
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
    console.error('Error updating dental chart:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;