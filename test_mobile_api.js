const axios = require('axios');

// Test both iOS and Android API URLs
const iOS_URL = 'http://127.0.0.1:8002/api';
const Android_URL = 'http://10.0.2.2:8002/api';

async function testMobileAPIConnectivity() {
  console.log('📱 Testing Mobile App API Connectivity...\n');
  
  // Test iOS Simulator URL
  console.log('🍎 Testing iOS Simulator URL:', iOS_URL);
  try {
    const response = await axios.get(`${iOS_URL}/docs/`, { timeout: 5000 });
    console.log('✅ iOS URL works:', response.status);
  } catch (error) {
    console.log('❌ iOS URL failed:', error.message);
  }
  
  // Test auth token
  console.log('\n🔐 Testing with real auth token...');
  const testToken = '8742ce5b9658a8b9b867687fe8bb9efc93c8dd48';
  
  try {
    const walletResponse = await axios.get(`${iOS_URL}/transactions/wallet/`, {
      headers: {
        'Authorization': `Token ${testToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Wallet API works with token:', walletResponse.status);
    console.log('   User:', walletResponse.data.user_name);
    console.log('   Balance:', walletResponse.data.escrow_balance, walletResponse.data.currency);
    
  } catch (error) {
    console.log('❌ Wallet API failed:', error.response?.status, error.response?.data || error.message);
  }
  
  // Test send money
  console.log('\n💸 Testing send money API...');
  try {
    const sendResponse = await axios.post(`${iOS_URL}/transactions/send/`, {
      recipient_phone: '+260971111111',
      amount: 5.00,
      description: 'API connectivity test'
    }, {
      headers: {
        'Authorization': `Token ${testToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Send money API works:', sendResponse.status);
    console.log('   Transaction ID:', sendResponse.data.transaction_id);
    console.log('   Status:', sendResponse.data.status);
    
  } catch (error) {
    console.log('❌ Send money API failed:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('\n🎉 Mobile API connectivity test complete!');
  console.log('The mobile app should now be able to connect to the backend.');
}

testMobileAPIConnectivity();