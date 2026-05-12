const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be either admin or staff'),
  body('organizationName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Organization name must be between 2 and 100 characters'),
  body('organizationEmail')
    .trim()
    .isEmail()
    .withMessage('Valid organization email is required')
    .normalizeEmail(),
  body('organizationPhone')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid organization phone number')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePatient = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('First name can only contain letters, spaces, and hyphens'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Last name can only contain letters, spaces, and hyphens'),
  body('dob')
    .isISO8601()
    .withMessage('Invalid date of birth')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }),
  body('phone')
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('medicalHistory.allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('medicalHistory.allergies.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each allergy must be less than 100 characters'),
  body('medicalHistory.conditions')
    .optional()
    .isArray()
    .withMessage('Conditions must be an array'),
  body('medicalHistory.conditions.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each condition must be less than 100 characters'),
  handleValidationErrors
];

const validateAppointment = [
  body('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('dentistId')
    .isMongoId()
    .withMessage('Invalid dentist ID'),
  body('date')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const now = new Date();
      if (appointmentDate < now) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  handleValidationErrors
];

const validateNote = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note must be between 1 and 1000 characters'),
  handleValidationErrors
];

const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

const validateNoteParams = [
  param('patientId')
    .isMongoId()
    .withMessage('Invalid patient ID format'),
  param('noteId')
    .isMongoId()
    .withMessage('Invalid note ID format'),
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validatePatient,
  validateAppointment,
  validateNote,
  validateMongoId,
  validateNoteParams,
  validateSearch
};
