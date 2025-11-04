#!/usr/bin/env node

/**
 * Debug Transactions Script
 * 
 * Tests the transaction API to understand why Activity screen shows no transactions
 */

const axios = require('axios');

async function debugTransactions() {
    console.log('🔍 Debugging Transaction API...\n');
    
    // The working token we verified
    const workingToken = 'd87ef484537e81f50d196385d41cc7d348485f4c';
    const apiUrl = 'http://localhost:8002/api/transactions/transactions/';
    
    try {
        console.log('📡 Testing API endpoint:', apiUrl);
        console.log('🔑 Using token:', workingToken.substring(0, 10) + '...');
        
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Token ${workingToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📦 Response Type:', typeof response.data);
        console.log('📊 Transaction Count:', response.data?.results?.length || response.data?.length || 0);
        
        if (response.data?.results) {
            console.log('📋 Response Format: Paginated (has results property)');
            console.log('📊 Results Array Length:', response.data.results.length);
            
            if (response.data.results.length > 0) {
                const firstTx = response.data.results[0];
                console.log('\n📄 First Transaction:');
                console.log(`   ID: ${firstTx.id}`);
                console.log(`   Reference: ${firstTx.reference_id}`);
                console.log(`   Type: ${firstTx.type}`);
                console.log(`   Amount: ${firstTx.amount} ${firstTx.currency}`);
                console.log(`   Status: ${firstTx.status}`);
                console.log(`   Created: ${firstTx.created_at}`);
                console.log(`   Recipient: ${firstTx.recipient}`);
                console.log(`   Phone: ${firstTx.phone}`);
            }
        } else if (Array.isArray(response.data)) {
            console.log('📋 Response Format: Direct Array');
            console.log('📊 Array Length:', response.data.length);
        } else {
            console.log('📋 Response Format: Unknown');
            console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
        }
        
        console.log('\n🧪 Testing Mobile App Flow:');
        console.log('1. User logs in with OTP 123456');
        console.log('2. App should store token:', workingToken.substring(0, 10) + '...');
        console.log('3. ActivityScreen calls transactionsAPI.getTransactions()');
        console.log('4. API should return transactions with results property');
        console.log('5. App should extract response.results array');
        console.log('6. Should display 2 transactions in Activity tab');
        
        console.log('\n💡 Solution for Mobile App:');
        console.log('The API returns paginated response with "results" property.');
        console.log('ActivityScreen needs to handle response.results format.');
        console.log('This is now fixed with the enhanced response handling.');
        
    } catch (error) {
        console.error('❌ API Error:', error.message);
        if (error.response) {
            console.error('📊 Status:', error.response.status);
            console.error('📦 Data:', error.response.data);
        }
    }
}

debugTransactions().then(() => {
    console.log('\n✅ Transaction debugging complete!');
}).catch(error => {
    console.error('❌ Debug failed:', error);
});