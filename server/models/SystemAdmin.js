const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// System Admin Schema - COMPLETELY DISCONNECTED from multi-tenant organizationId
// This model handles system-level administration and approvals only
// No organizational scoping - operates across all tenants for auditing and approval
const systemAdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
    unique: true // Global uniqueness - one system admin per username across entire platform
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Never return password in queries unless explicitly selected
  },
  // System admins have elevated privileges across all organizations
  // No role field needed - all system admins have full system access
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
// SECURITY: Ensures passwords are never stored in plain text
systemAdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
// SECURITY: Used during login to verify credentials without exposing hash
systemAdminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('SystemAdmin', systemAdminSchema);