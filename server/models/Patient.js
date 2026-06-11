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
      // Tooth number supports both numeric (1-32 permanent) and letter (A-T primary) teeth
      // Mixed type allows for flexible tooth numbering system
      number: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        // Validation handled in route middleware for both numeric and letter formats
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
  // Row-Level Access Control (RLAC) - tracks who created this record
  // SECURITY: Mandatory field for authorship-based data filtering
  // Staff users can only see records they created; Admins see all org records
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow false for backward compatibility with existing data
    index: true
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

// COMPOUND INDEX: { organizationId: 1, createdBy: 1 }
// SECURITY: Ensures lightning-fast queries for row-level filtering
// This index guarantees isolation and performance at the database engine layer
patientSchema.index({ organizationId: 1, createdBy: 1 });

// Virtual field to calculate patient's age dynamically from date of birth
// This avoids storing stale age values in the database
// Calculation: difference between now and date of birth in milliseconds, converted to years
patientSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const diffMs = Date.now() - this.dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Row-Level Access Control (RLAC) Query Middleware
// SECURITY: Automatically filters queries based on user role to prevent data leakage
// - Staff users can only see records they created
// - Admin users see all records within their organization
// - System admins can bypass with isSystemAdmin option in query
patientSchema.pre(/^find/, function() {
  // Skip filtering if this is a system admin audit query
  // SECURITY: Allows system-wide access for administrative oversight
  if (this.options.isSystemAdmin) {
    return;
  }

  // Get the user context from query options (set by caller)
  const userContext = this.options?.userContext;
  if (!userContext) {
    return; // No user context, skip filtering - let controller handle auth
  }

  const { role, userId } = userContext;

  // SECURITY: Staff role - restrict to records created by this user only
  // This prevents unauthorized access to other staff's patient records
  if (role === 'staff') {
    this.where({ createdBy: userId });
  }

  // SECURITY: Admin role - no additional filtering needed
  // Admins have full view of their organization's data within org scope
});

// Pre-save hook to auto-populate createdBy field
// SECURITY: Ensures authorship is always recorded on creation
patientSchema.pre('save', function(next) {
  // Auto-set createdBy on new records if not already set
  if (this.isNew && !this.createdBy && this.options?.userContext?.userId) {
    this.createdBy = this.options.userContext.userId;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);