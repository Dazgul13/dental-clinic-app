const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  // Status flag for administrative approval workflow
  // - Pending: Organization signed up but awaiting admin approval
  // - Approved: Organization can access the platform
  // - Suspended: Organization access revoked (violations, non-payment, etc.)
  // SECURITY: Login will be blocked if status is not Approved
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Suspended'],
    default: 'Pending',
    index: true
  },
  // Unique slug for secure clinic lookup - prevents enumeration attacks
  // SECURITY: Used instead of public dropdown to avoid exposing organization list
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/ // Only lowercase letters, numbers, hyphens for URL safety
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  settings: {
    timezone: { type: String, default: 'America/New_York' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
    appointmentDuration: { type: Number, default: 30 } // minutes
  },
  subscription: {
    plan: { type: String, enum: ['trial', 'basic', 'premium', 'enterprise'], default: 'trial' },
    status: { type: String, enum: ['active', 'suspended', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
