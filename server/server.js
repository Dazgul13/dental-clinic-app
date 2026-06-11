const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const sysAdminRoutes = require('./routes/sysAdminRoutes');

dotenv.config();

connectDB();

const app = express();

// Security Headers - Enable CSP and HSTS in production
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production'
}));

// CORS Configuration - Dynamic handling for local and deployed environments
const isProduction = process.env.NODE_ENV === 'production';
let clientUrl = process.env.CLIENT_URL;
if (clientUrl) {
  // Remove trailing slash if present to avoid CORS issues
  clientUrl = clientUrl.replace(/\/+$/, '');
}
const corsOptions = {
  origin: isProduction
    ? clientUrl
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting - General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 req in prod, 1000 in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiting - Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 req in prod, 100 in dev
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// SECURITY: Strict rate limiter for slug verification endpoint
// Prevents enumeration attacks by limiting automated bot scraping attempts
const slugVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // Very strict in production
  message: 'Too many verification attempts, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Body Parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

app.get('/', (req, res) => {
  res.json({ message: 'Dental Clinic API is running' });
});

// Apply rate limiters
app.use('/api/auth', authLimiter, authRoutes);
// SECURITY: Apply strict rate limiter to verify-slug to prevent enumeration attacks
app.use('/api/organization/verify-slug', slugVerifyLimiter);
app.use('/api/organization', organizationRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
// System admin routes - separate from tenant routes for administrative oversight
app.use('/api/sys-admin', apiLimiter, sysAdminRoutes);
app.use('/api', apiLimiter);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
