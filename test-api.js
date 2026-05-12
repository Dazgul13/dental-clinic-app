const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing Dental Clinic API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverResponse = await axios.get('http://localhost:5000');
    console.log('✅ Server is running:', serverResponse.data.message);

    // Test 2: Test user registration
    console.log('\n2. Testing user registration...');
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        username: 'testuser',
        password: 'Test123!',
        role: 'staff'
      });
      console.log('✅ User registration successful');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists (this is fine)');
      } else {
        console.log('❌ Registration error:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Test user login
    console.log('\n3. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'Admin123!'
    });
    console.log('✅ Login successful');
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    // Test 4: Test protected route (get patients)
    console.log('\n4. Testing protected route (patients)...');
    const patientsResponse = await axios.get(`${API_BASE}/patients`, { headers });
    console.log('✅ Patients endpoint accessible');
    console.log('Patients count:', patientsResponse.data.length);

    // Test 5: Test adding a patient
    console.log('\n5. Testing add patient...');
    const newPatient = {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1990-01-01',
      phone: '555-0123',
      email: 'john.doe@example.com',
      medicalHistory: {
        allergies: ['Penicillin'],
        conditions: ['Hypertension']
      }
    };
    
    const addPatientResponse = await axios.post(`${API_BASE}/patients`, newPatient, { headers });
    console.log('✅ Patient added successfully');
    const patientId = addPatientResponse.data._id;

    // Test 6: Test adding appointment
    console.log('\n6. Testing add appointment...');
    const newAppointment = {
      patientId: patientId,
      dentistId: loginResponse.data._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 'scheduled'
    };
    
    const addAppointmentResponse = await axios.post(`${API_BASE}/appointments`, newAppointment, { headers });
    console.log('✅ Appointment added successfully');

    // Test 7: Test adding clinical note
    console.log('\n7. Testing add clinical note...');
    const noteResponse = await axios.post(`${API_BASE}/patients/${patientId}/notes`, {
      text: 'Patient came in for routine checkup. No issues found.'
    }, { headers });
    console.log('✅ Clinical note added successfully');

    console.log('\n🎉 All API tests passed! The backend is working correctly.');
    console.log('\n📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: Admin123!');
    console.log('\n🌐 Frontend URL: http://localhost:3000');

  } catch (error) {
    console.log('❌ API Test failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('Full error:', error.response?.data);
  }
}

testAPI();