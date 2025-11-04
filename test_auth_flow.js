const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8002/api';

async function testAuthFlow() {
  console.log('🔐 Testing Flash Authentication Flow...\n');
  
  try {
    // Test registration
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register/`, {
      phone_number: '+260977123456',
      password: 'test123',
      password_confirm: 'test123',
      full_name: 'Test User'
    }, {
      timeout: 5000
    });
    
    console.log('✅ Registration successful');
    console.log('Token:', registerResponse.data.token);
    console.log('User:', registerResponse.data.user);
    
    const token = registerResponse.data.token;
    
    // Test protected endpoint with token
    console.log('\n2. Testing protected endpoint with token...');
    const walletResponse = await axios.get(`${BASE_URL}/transactions/wallet/`, {
      headers: {
        'Authorization': `Token ${token}`
      },
      timeout: 5000
    });
    
    console.log('✅ Wallet access successful');
    console.log('Wallet data:', walletResponse.data);
    
    // Test send money with token
    console.log('\n3. Testing send money with token...');
    const sendResponse = await axios.post(`${BASE_URL}/transactions/send/`, {
      recipient_phone: '+260971234567',
      amount: 10.00,
      description: 'Test payment'
    }, {
      headers: {
        'Authorization': `Token ${token}`
      },
      timeout: 5000
    });
    
    console.log('✅ Send money successful');
    console.log('Transaction:', sendResponse.data);
    
    console.log('\n🎉 Authentication flow works perfectly!');
    console.log('The issue is that the mobile app needs to log in first.');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('💡 User might already exist. Trying login...');
      
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, {
          phone_number: '+260977123456',
          password: 'test123'
        });
        
        console.log('✅ Login successful');
        console.log('Token:', loginResponse.data.token);
        
      } catch (loginError) {
        console.error('❌ Login also failed:', loginError.response?.data || loginError.message);
      }
    }
  }
}

testAuthFlow();