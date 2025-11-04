const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8002/api';

const testUsers = [
  {
    phone_number: '+260971111111',
    password: 'test123',
    full_name: 'John Mwanza'
  },
  {
    phone_number: '+260977777777',
    password: 'test123',
    full_name: 'Sarah Banda'
  },
  {
    phone_number: '+260976666666',
    password: 'test123',
    full_name: 'Mary Lungu'
  }
];

async function createTestUsers() {
  console.log('🔧 Creating Flash Payment Test Users...\n');
  
  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.full_name} (${user.phone_number})`);
      
      const response = await axios.post(`${BASE_URL}/auth/register/`, {
        phone_number: user.phone_number,
        password: user.password,
        password_confirm: user.password,
        full_name: user.full_name
      }, {
        timeout: 5000
      });
      
      console.log(`✅ ${user.full_name} created successfully`);
      console.log(`   Token: ${response.data.token}`);
      console.log(`   User ID: ${response.data.user.id}\n`);
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`⚠️  ${user.full_name} already exists, trying login...`);
        
        try {
          const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, {
            phone_number: user.phone_number,
            password: user.password
          });
          
          console.log(`✅ ${user.full_name} login successful`);
          console.log(`   Token: ${loginResponse.data.token}\n`);
          
        } catch (loginError) {
          console.log(`❌ ${user.full_name} login failed:`, loginError.response?.data || loginError.message);
        }
      } else {
        console.error(`❌ Failed to create ${user.full_name}:`, error.response?.data || error.message);
      }
    }
  }
  
  console.log('🎉 Test users setup complete!');
  console.log('\nYou can now login to the Flash app with any of these users:');
  testUsers.forEach(user => {
    console.log(`📱 Phone: ${user.phone_number} | Password: ${user.password} | Name: ${user.full_name}`);
  });
}

createTestUsers();