const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8002/api';

async function createSimpleTestUser() {
  console.log('🔧 Creating simple test user for OTP flow...\n');
  
  const testUser = {
    phone_number: '+260977999888',
    password: 'otp123',
    full_name: 'OTP Test User'
  };
  
  try {
    console.log(`Creating user: ${testUser.full_name} (${testUser.phone_number})`);
    
    const response = await axios.post(`${BASE_URL}/auth/register/`, {
      phone_number: testUser.phone_number,
      password: testUser.password,
      password_confirm: testUser.password,
      full_name: testUser.full_name
    }, {
      timeout: 5000
    });
    
    console.log(`✅ ${testUser.full_name} created successfully`);
    console.log(`   Token: ${response.data.token}`);
    console.log(`   User ID: ${response.data.user.id}`);
    
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(`⚠️  User already exists, trying login...`);
      
      try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, {
          phone_number: testUser.phone_number,
          password: testUser.password
        });
        
        console.log(`✅ Login successful`);
        console.log(`   Token: ${loginResponse.data.token}`);
        
        return loginResponse.data;
        
      } catch (loginError) {
        console.log(`❌ Login failed:`, loginError.response?.data || loginError.message);
        return null;
      }
    } else {
      console.error(`❌ Failed to create user:`, error.response?.data || error.message);
      return null;
    }
  }
}

async function testSendMoney(token) {
  console.log('\n💸 Testing send money with auth token...');
  
  try {
    const response = await axios.post(`${BASE_URL}/transactions/send/`, {
      recipient_phone: '+260971111111',
      amount: 10.00,
      description: 'OTP test payment'
    }, {
      headers: {
        'Authorization': `Token ${token}`
      },
      timeout: 5000
    });
    
    console.log('✅ Send money successful!');
    console.log('Transaction ID:', response.data.transaction_id);
    console.log('Status:', response.data.status);
    
  } catch (error) {
    console.error('❌ Send money failed:', error.response?.data || error.message);
  }
}

async function main() {
  const authData = await createSimpleTestUser();
  
  if (authData && authData.token) {
    await testSendMoney(authData.token);
    
    console.log('\n🎉 Backend authentication is working!');
    console.log('\n📱 Now test the mobile app:');
    console.log('1. Enter phone: +260977999888');
    console.log('2. Enter OTP: 123456');
    console.log('3. Try sending money - should work!');
  }
}

main();