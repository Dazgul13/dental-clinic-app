const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'reschedule'],
      default: 'scheduled'
    },
    notes: {
      type: String,
      default: ''
    },
    // Row-Level Access Control (RLAC) - tracks who created this appointment
    // SECURITY: Mandatory field for authorship-based data filtering
    // Staff users can only see appointments they created; Admins see all org appointments
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Allow false for backward compatibility with existing data
      index: true
    }
  },
  { timestamps: true }
);

// COMPOUND INDEX: { organizationId: 1, createdBy: 1 }
// SECURITY: Ensures lightning-fast queries for row-level filtering
// This index guarantees isolation and performance at the database engine layer
appointmentSchema.index({ organizationId: 1, createdBy: 1 });

// Row-Level Access Control (RLAC) Query Middleware
// SECURITY: Automatically filters queries based on user role to prevent unauthorized access
// - Staff users can only see appointments they created
// - Admin users see all appointments within their organization
// - System admins can bypass with isSystemAdmin option in query
appointmentSchema.pre(/^find/, function() {
  // SECURITY: Skip filtering if this is a system admin audit query
  // Allows system-wide access for administrative oversight across all organizations
  if (this.options.isSystemAdmin) {
    return;
  }

  // Get the user context from query options (set by controller)
  const userContext = this.options?.userContext;
  if (!userContext) {
    return; // No user context, skip filtering
  }

  const { role, userId } = userContext;

  // SECURITY: Staff role - restrict to appointments created by this user only
  // Prevents staff from viewing other staff's appointment schedules
  if (role === 'staff') {
    this.where({ createdBy: userId });
  }

  // SECURITY: Admin role - no additional filtering needed
  // Admins have full view of their organization's appointment data
});

// Pre-save hook to auto-populate createdBy field
// SECURITY: Ensures authorship is always recorded on creation
appointmentSchema.pre('save', function(next) {
  // Auto-set createdBy on new appointments if not already set
  if (this.isNew && !this.createdBy && this.options?.userContext?.userId) {
    this.createdBy = this.options.userContext.userId;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);