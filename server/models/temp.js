const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
    // Ensures each patient is tied to a specific organization for multi-tenant isolation
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date,
    required: true
    // Date of birth used to calculate dynamic age virtual
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String
  },
  medicalHistory: {
    allergies: [{
      type: String
    }],
    conditions: [{
      type: String
    }]
  },
  clinicalNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      required: true
    },
    dentist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  dentalChart: {
    teeth: [{
      number: {
        type: Number,
        required: true,
        min: 1,
        max: 32
      },
      status: {
        type: String,
        enum: ['healthy', 'cavity', 'filled', 'crown', 'missing', 'root-canal', 'implant'],
        default: 'healthy'
      },
      surfaces: {
        mesial: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        },
        occlusal: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        },
        distal: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        },
        buccal: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        },
        lingual: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        },
        incisal: {
          status: { type: String, enum: ['healthy', 'cavity', 'filled', 'watch'], default: 'healthy' },
          notes: { type: String, default: '' }
        }
      },
      notes: {
        type: String,
        default: ''
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    }]
  },
  // Array of treatment plans for this patient
  // Each plan is embedded as a subdocument for easy retrieval with patient data
  treatmentPlans: [{
    toothNumber: {
      type: String,
      // Could be a number or string like '18' or ' wisdom tooth'
    },
    surface: {
      type: String,
      // e.g., 'M' (mesial), 'O' (occlusal), 'D' (distal), 'B' (buccal), 'L' (lingual), or combinations like 'MOD'
    },
    procedure: {
      type: String,
      required: true
      // e.g., 'Composite Filling', 'Root Canal', 'Crown'
    },
    status: {
      type: String,
      enum: ['Proposed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Proposed'
      // Tracks the lifecycle of the treatment plan
    },
    cost: {
      type: Number
      // Cost of the procedure in currency units (e.g., dollars)
    },
    createdAt: {
      type: Date,
      default: Date.now
      // Timestamp when the treatment plan was created
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field to calculate patient's age dynamically from date of birth
// This avoids storing stale age values in the database
// Calculation: difference between now and date of birth in milliseconds, converted to years
patientSchema.virtual('age').get(function() {
  if (!this.dob) return null; // Return null if DOB is not set
  const diffMs = Date.now() - this.dob.getTime(); // Milliseconds between now and DOB
  const ageDate = new Date(diffMs); // Create a date from the difference
  // Extract years from the date (UTC to avoid timezone issues)
  // Subtract 1970 because the Unix epoch starts at 1970-01-01
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

module.exports = mongoose.model('Patient', patientSchema);