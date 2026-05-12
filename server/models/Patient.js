const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
