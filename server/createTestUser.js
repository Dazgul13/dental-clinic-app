const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { connectTestDB } = require('./config/testDb');

// User Schema (inline for this script)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'staff'],
    default: 'staff'
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const createTestUser = async () => {
  try {
    await connectTestDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Test user already exists!');
      return;
    }

    // Create test user
    const testUser = await User.create({
      username: 'admin',
      password: 'Admin123!',
      role: 'admin'
    });

    console.log('Test user created successfully!');
    console.log('Username: admin');
    console.log('Password: Admin123!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  }
};

createTestUser();