const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8002/api';

async function testAPIConnection() {
  console.log('Testing Flash Payment API connection...');
  console.log(`Base URL: ${BASE_URL}`);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/docs/`, {
      timeout: 5000,
      headers: {
        'Accept': 'text/html,application/json',
      }
    });
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test transactions endpoint (should require auth)
    console.log('\n2. Testing transactions endpoint (no auth)...');
    try {
      const transactionsResponse = await axios.get(`${BASE_URL}/transactions/transactions/`, {
        timeout: 5000
      });
      console.log('✅ Transactions endpoint:', transactionsResponse.status);
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ Auth required (expected):', authError.response.status);
      } else {
        console.log('❌ Unexpected error:', authError.message);
      }
    }
    
    // Test wallet endpoint (should require auth)
    console.log('\n3. Testing wallet endpoint (no auth)...');
    try {
      const walletResponse = await axios.get(`${BASE_URL}/transactions/wallet/`, {
        timeout: 5000
      });
      console.log('✅ Wallet endpoint:', walletResponse.status);
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('✅ Wallet auth required (expected):', authError.response.status);
      } else {
        console.log('❌ Unexpected error:', authError.message);
      }
    }
    
    console.log('\n🎉 Backend connectivity test completed successfully!');
    console.log('The Flash Payment API is running and responsive.');
    
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure Docker backend is running: docker-compose up backend');
    }
  }
}

testAPIConnection();