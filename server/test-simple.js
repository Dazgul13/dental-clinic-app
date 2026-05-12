console.log('Testing basic Node.js...');

try {
  const express = require('express');
  console.log('✅ Express loaded');
  
  const dotenv = require('dotenv');
  console.log('✅ Dotenv loaded');
  
  const cors = require('cors');
  console.log('✅ CORS loaded');
  
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded');
  
  console.log('✅ All basic dependencies loaded successfully');
  
} catch (error) {
  console.log('❌ Error loading dependencies:', error.message);
}