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
