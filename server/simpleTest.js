const axios = require('axios');

async function simpleTest() {
  try {
    // Test registration with simple credentials
    console.log('Testing registration...');
    const registerData = {
      username: 'demo',
      password: 'Demo123!',
      role: 'admin'
    };
    
    try {
      const regResponse = await axios.post('http://localhost:5000/api/auth/register', registerData);
      console.log('✅ Registration successful:', regResponse.data.username);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️ User already exists');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message);
      }
    }

    // Test login
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'demo',
      password: 'Demo123!'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.username);
    console.log('Role:', loginResponse.data.role);
    console.log('Token exists:', !!loginResponse.data.token);
    
    console.log('\n🎉 SUCCESS! You can now login with:');
    console.log('Username: demo');
    console.log('Password: Demo123!');
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
  }
}

simpleTest();