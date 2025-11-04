#!/usr/bin/env python3
"""
MTN Collections API Test Script
Tests the MTN Mobile Money Collections API with your subscription keys
"""

import requests
import json
import sys
import uuid
from decimal import Decimal

# MTN Collections API Configuration
MTN_COLLECTIONS_SUB_KEY = "934de52c869f4f20bc76f4808cddedd1"
MTN_COLLECTIONS_SUB_KEY_ALT = "7b8b2d3b14d64dd596c9a29e3ec240c1"
MTN_BASE_URL = "https://sandbox.momodeveloper.mtn.com"
MTN_TARGET_ENV = "sandbox"

# These need to be configured (you'll need to get these from MTN Developer Portal)
MTN_USER_ID = "your-user-id"  # UUID from MTN sandbox provisioning
MTN_API_KEY = "your-api-key"  # API key from MTN sandbox provisioning

def test_mtn_collections_token():
    """Test MTN Collections API token generation"""
    
    print("🔑 Testing MTN Collections Token Generation")
    print("-" * 50)
    
    url = f"{MTN_BASE_URL}/collection/token/"
    headers = {
        "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_SUB_KEY,
        "Content-Type": "application/json"
    }
    
    # Basic Auth with User ID and API Key
    auth = (MTN_USER_ID, MTN_API_KEY)
    
    print(f"URL: {url}")
    print(f"Subscription Key: {MTN_COLLECTIONS_SUB_KEY[:8]}...")
    print(f"User ID: {MTN_USER_ID}")
    
    try:
        response = requests.post(url, headers=headers, auth=auth)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Token generation successful!")
            print(f"Access Token: {token_data.get('access_token', 'N/A')[:20]}...")
            print(f"Token Type: {token_data.get('token_type', 'N/A')}")
            print(f"Expires In: {token_data.get('expires_in', 'N/A')} seconds")
            return token_data.get('access_token')
        else:
            print("❌ Token generation failed!")
            return None
            
    except Exception as e:
        print(f"❌ Token generation error: {e}")
        return None

def test_request_to_pay(access_token):
    """Test MTN Collections request-to-pay"""
    
    print("\n💰 Testing MTN Collections Request-to-Pay")
    print("-" * 50)
    
    if not access_token:
        print("❌ No access token available")
        return None
    
    reference_id = str(uuid.uuid4())
    url = f"{MTN_BASE_URL}/collection/v1_0/requesttopay"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Reference-Id": reference_id,
        "X-Target-Environment": MTN_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_SUB_KEY,
        "Content-Type": "application/json"
    }
    
    # Test payment request
    payload = {
        "amount": "100.00",
        "currency": "EUR",  # MTN sandbox uses EUR
        "externalId": f"flash-test-{reference_id[:8]}",
        "payer": {
            "partyIdType": "MSISDN",
            "partyId": "260971234567"  # Test Zambian number
        },
        "payerMessage": "Flash payment test",
        "payeeNote": "Test payment from Flash app"
    }
    
    print(f"URL: {url}")
    print(f"Reference ID: {reference_id}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 202:
            print("✅ Payment request sent successfully!")
            print(f"Reference ID: {reference_id}")
            return reference_id
        else:
            print("❌ Payment request failed!")
            return None
            
    except Exception as e:
        print(f"❌ Payment request error: {e}")
        return None

def test_payment_status(access_token, reference_id):
    """Test MTN Collections payment status check"""
    
    print("\n📊 Testing MTN Collections Payment Status")
    print("-" * 50)
    
    if not access_token or not reference_id:
        print("❌ Missing access token or reference ID")
        return
    
    url = f"{MTN_BASE_URL}/collection/v1_0/requesttopay/{reference_id}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Target-Environment": MTN_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_SUB_KEY
    }
    
    print(f"URL: {url}")
    print(f"Reference ID: {reference_id}")
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            status_data = response.json()
            print("✅ Status check successful!")
            print(f"Payment Status: {status_data.get('status', 'N/A')}")
            print(f"Amount: {status_data.get('amount', 'N/A')} {status_data.get('currency', 'N/A')}")
            print(f"Financial Transaction ID: {status_data.get('financialTransactionId', 'N/A')}")
        else:
            print("❌ Status check failed!")
            
    except Exception as e:
        print(f"❌ Status check error: {e}")

def test_account_balance(access_token):
    """Test MTN Collections account balance"""
    
    print("\n💳 Testing MTN Collections Account Balance")
    print("-" * 50)
    
    if not access_token:
        print("❌ No access token available")
        return
    
    url = f"{MTN_BASE_URL}/collection/v1_0/account/balance"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Target-Environment": MTN_TARGET_ENV,
        "Ocp-Apim-Subscription-Key": MTN_COLLECTIONS_SUB_KEY
    }
    
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            balance_data = response.json()
            print("✅ Balance check successful!")
            print(f"Available Balance: {balance_data.get('availableBalance', 'N/A')}")
            print(f"Currency: {balance_data.get('currency', 'N/A')}")
        else:
            print("❌ Balance check failed!")
            
    except Exception as e:
        print(f"❌ Balance check error: {e}")

def setup_instructions():
    """Print setup instructions for MTN Collections API"""
    
    print("\n📋 MTN Collections API Setup Instructions")
    print("=" * 60)
    print("""
To complete the MTN Collections API setup, you need:

1. **Create MTN Developer Account**:
   - Go to https://momodeveloper.mtn.com/
   - Sign up for a developer account
   - Subscribe to Collections API

2. **Get Sandbox Credentials**:
   - Create a sandbox environment
   - Generate User ID (UUID)
   - Generate API Key
   - These are different from subscription keys

3. **Update .env file** with:
   ```
   MTN_USER_ID=your-sandbox-user-id
   MTN_API_KEY=your-sandbox-api-key
   ```

4. **Test Environment**:
   - MTN sandbox uses EUR currency
   - Test phone numbers are provided in MTN docs
   - Payments are simulated, not real

5. **Production Setup**:
   - Apply for production access
   - Complete KYC verification
   - Get production credentials
   - Switch to production endpoints
""")

def main():
    """Main test function"""
    
    print("🧪 MTN Collections API Test Suite")
    print("=" * 60)
    print(f"Subscription Key (Primary): {MTN_COLLECTIONS_SUB_KEY}")
    print(f"Subscription Key (Secondary): {MTN_COLLECTIONS_SUB_KEY_ALT}")
    print(f"Base URL: {MTN_BASE_URL}")
    print(f"Target Environment: {MTN_TARGET_ENV}")
    
    # Check if we have user credentials
    if MTN_USER_ID == "your-user-id" or MTN_API_KEY == "your-api-key":
        print("\n⚠️  MTN User ID and API Key not configured!")
        print("The subscription keys are available, but you need sandbox user credentials.")
        setup_instructions()
        return
    
    # Test 1: Generate access token
    access_token = test_mtn_collections_token()
    
    if access_token:
        # Test 2: Request payment
        reference_id = test_request_to_pay(access_token)
        
        # Test 3: Check payment status
        if reference_id:
            test_payment_status(access_token, reference_id)
        
        # Test 4: Check account balance
        test_account_balance(access_token)
    
    print("\n" + "=" * 60)
    print("🎯 MTN Collections API Testing Complete!")
    print("\n📝 Next Steps:")
    print("1. Get MTN sandbox user credentials (User ID + API Key)")
    print("2. Update backend/.env with credentials")  
    print("3. Test payment flows with Flash app")
    print("4. Integrate with real MTN Mobile Money")

if __name__ == '__main__':
    main()