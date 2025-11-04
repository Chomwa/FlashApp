#!/usr/bin/env node
/**
 * Test script to verify frontend can connect to backend
 * This simulates the mobile app's API calls
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8002/api';

async function testConnection() {
    console.log('🔗 Testing Frontend-Backend Connection');
    console.log('=====================================');
    
    try {
        // Test 1: Basic API health check
        console.log('\n1. Testing API health...');
        const healthResponse = await axios.get(`${BASE_URL}/auth/me/`);
        console.log('❌ Unexpected success (should be 401)');
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ API responding correctly (401 unauthorized as expected)');
        } else {
            console.log(`❌ API error: ${error.message}`);
            return false;
        }
    }
    
    try {
        // Test 2: Test registration (simulating mobile app)
        console.log('\n2. Testing user registration...');
        const registerData = {
            phone_number: '+260999888777',
            password: 'testpass123',
            password_confirm: 'testpass123',
            full_name: 'Frontend Test User'
        };
        
        const registerResponse = await axios.post(`${BASE_URL}/auth/register/`, registerData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (registerResponse.status === 201) {
            console.log('✅ Registration successful from frontend');
        } else {
            console.log('⚠️  Registration returned unexpected status');
        }
        
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('⚠️  User already exists (expected for repeat tests)');
        } else {
            console.log(`❌ Registration failed: ${error.message}`);
            console.log('❌ This indicates frontend-backend connection issues');
            return false;
        }
    }
    
    try {
        // Test 3: Test login (simulating mobile app)
        console.log('\n3. Testing user login...');
        const loginData = {
            phone_number: '+260999888777',
            password: 'testpass123'
        };
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (loginResponse.status === 200 && loginResponse.data.token) {
            console.log('✅ Login successful from frontend');
            const token = loginResponse.data.token;
            
            // Test 4: Test authenticated request (simulating mobile app)
            console.log('\n4. Testing authenticated request...');
            const walletResponse = await axios.get(`${BASE_URL}/transactions/wallet/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (walletResponse.status === 200) {
                console.log('✅ Authenticated request successful');
                console.log(`   Wallet balance: ${walletResponse.data.escrow_balance} ZMW`);
                return true;
            }
        }
        
    } catch (error) {
        console.log(`❌ Login/Auth test failed: ${error.message}`);
        if (error.response) {
            console.log(`   Response status: ${error.response.status}`);
            console.log(`   Response data: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
    
    return false;
}

async function testMobileAppScenario() {
    console.log('\n📱 Testing Mobile App Scenario');
    console.log('==============================');
    
    try {
        // Simulate sending money from mobile app
        console.log('\n5. Testing send money flow...');
        
        // First login to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login/`, {
            phone_number: '+260999888777',
            password: 'testpass123'
        });
        
        const token = loginResponse.data.token;
        
        // Send money request
        const sendData = {
            recipient_phone: '+260977654321',
            amount: 25.00,
            description: 'Frontend connection test'
        };
        
        const sendResponse = await axios.post(`${BASE_URL}/transactions/send/`, sendData, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (sendResponse.status === 201) {
            console.log('✅ Send money API call successful from frontend');
            console.log(`   Transaction ID: ${sendResponse.data.transaction?.id}`);
        }
        
        return true;
        
    } catch (error) {
        console.log(`❌ Mobile app scenario failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Error: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

async function main() {
    console.log('Testing connection between React Native app and Django backend...\n');
    
    const connectionTest = await testConnection();
    const mobileTest = await testMobileAppScenario();
    
    console.log('\n=====================================');
    if (connectionTest && mobileTest) {
        console.log('🎉 Frontend-Backend Connection: ✅ WORKING');
        console.log('\n✅ The mobile app should be able to:');
        console.log('   - Register new users');
        console.log('   - Login existing users');
        console.log('   - Make authenticated API calls');
        console.log('   - Send money requests');
        console.log('   - Access wallet information');
        console.log('\n📱 Mobile app is ready for testing!');
    } else {
        console.log('❌ Frontend-Backend Connection: FAILED');
        console.log('\n🔧 Troubleshooting steps:');
        console.log('   1. Check if backend is running: docker-compose ps');
        console.log('   2. Check CORS settings in Django');
        console.log('   3. Verify mobile app API base URL');
        console.log('   4. Check iOS simulator network connectivity');
    }
}

main().catch(console.error);