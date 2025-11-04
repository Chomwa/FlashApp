#!/usr/bin/env python3
"""
Complete MTN Collections API Setup Script
Walks through the exact MTN MoMo API calls to set up Collections API
"""

import requests
import json
import uuid
import base64
import sys

# Your subscription keys
MTN_COLLECTION_SUB_KEY = "934de52c869f4f20bc76f4808cddedd1"
MTN_COLLECTION_SUB_KEY_ALT = "7b8b2d3b14d64dd596c9a29e3ec240c1"
MTN_BASE_URL = "https://sandbox.momodeveloper.mtn.com"

def step_1_create_api_user():
    """Step 1: Create API User"""
    
    print("1️⃣  Creating MTN API User")
    print("-" * 40)
    
    # Generate UUID for API user ID
    api_user_id = str(uuid.uuid4())
    print(f"Generated API User ID: {api_user_id}")
    
    url = f"{MTN_BASE_URL}/v1_0/apiuser"
    headers = {
        "X-Reference-Id": api_user_id,
        "Ocp-Apim-Subscription-Key": MTN_COLLECTION_SUB_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "providerCallbackHost": "https://your-domain.com/mtn/webhook"
    }
    
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"\nResponse:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Body: {response.text}")
        
        if response.status_code == 201:
            print("✅ API User created successfully!")
            print(f"💾 Save this API_USER_ID: {api_user_id}")
            return api_user_id
        else:
            print("❌ API User creation failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error creating API user: {e}")
        return None

def step_2_create_api_key(api_user_id):
    """Step 2: Create API Key"""
    
    print(f"\n2️⃣  Creating API Key for User: {api_user_id}")
    print("-" * 40)
    
    url = f"{MTN_BASE_URL}/v1_0/apiuser/{api_user_id}/apikey"
    headers = {
        "Ocp-Apim-Subscription-Key": MTN_COLLECTION_SUB_KEY
    }
    
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    
    try:
        response = requests.post(url, headers=headers)
        
        print(f"\nResponse:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Body: {response.text}")
        
        if response.status_code == 201:
            api_key_data = response.json()
            api_key = api_key_data.get('apiKey')
            print("✅ API Key created successfully!")
            print(f"💾 Save this API_KEY: {api_key}")
            return api_key
        else:
            print("❌ API Key creation failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error creating API key: {e}")
        return None

def step_3_get_access_token(api_user_id, api_key):
    """Step 3: Get Access Token"""
    
    print(f"\n3️⃣  Getting Access Token")
    print("-" * 40)
    
    url = f"{MTN_BASE_URL}/collection/token/"
    
    # Create Basic Auth header
    credentials = f"{api_user_id}:{api_key}"
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Ocp-Apim-Subscription-Key": MTN_COLLECTION_SUB_KEY,
        "Authorization": f"Basic {credentials_b64}"
    }
    
    print(f"URL: {url}")
    print(f"Credentials: {api_user_id}:{api_key[:8]}...")
    print(f"Basic Auth: {credentials_b64[:20]}...")
    
    try:
        response = requests.post(url, headers=headers)
        
        print(f"\nResponse:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Body: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in')
            print("✅ Access Token obtained successfully!")
            print(f"💾 Access Token: {access_token[:20]}...")
            print(f"⏰ Expires in: {expires_in} seconds")
            return access_token
        else:
            print("❌ Access Token request failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error getting access token: {e}")
        return None

def step_4_request_to_pay(access_token):
    """Step 4: Send Money Request (RequestToPay)"""
    
    print(f"\n4️⃣  Initiating P2P Request-to-Pay")
    print("-" * 40)
    
    payment_uuid = str(uuid.uuid4())
    url = f"{MTN_BASE_URL}/collection/v1_0/requesttopay"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Reference-Id": payment_uuid,
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": MTN_COLLECTION_SUB_KEY,
        "Content-Type": "application/json"
    }
    
    # Test payment request - this will trigger MoMo prompt to user
    payload = {
        "amount": "10.00",
        "currency": "ZMW",  # Zambian Kwacha
        "externalId": f"flash-txn-{payment_uuid[:8]}",
        "payer": {
            "partyIdType": "MSISDN",
            "partyId": "260971234567"  # Test Zambian MTN number
        },
        "payerMessage": "Flash payment test",
        "payeeNote": "Test payment from Flash app"
    }
    
    print(f"URL: {url}")
    print(f"Payment UUID: {payment_uuid}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"\nResponse:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Body: {response.text}")
        
        if response.status_code == 202:
            print("✅ Payment request sent successfully!")
            print("📱 User will receive MoMo/USSD prompt to approve")
            print(f"💾 Save this Payment Reference: {payment_uuid}")
            return payment_uuid
        else:
            print("❌ Payment request failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error sending payment request: {e}")
        return None

def step_5_check_payment_status(access_token, payment_uuid):
    """Step 5: Check Payment Status"""
    
    print(f"\n5️⃣  Checking Payment Status")
    print("-" * 40)
    
    url = f"{MTN_BASE_URL}/collection/v1_0/requesttopay/{payment_uuid}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "X-Target-Environment": "sandbox",
        "Ocp-Apim-Subscription-Key": MTN_COLLECTION_SUB_KEY
    }
    
    print(f"URL: {url}")
    print(f"Payment UUID: {payment_uuid}")
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"\nResponse:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Body: {response.text}")
        
        if response.status_code == 200:
            status_data = response.json()
            payment_status = status_data.get('status')
            amount = status_data.get('amount')
            currency = status_data.get('currency')
            financial_txn_id = status_data.get('financialTransactionId')
            
            print("✅ Status check successful!")
            print(f"💰 Amount: {amount} {currency}")
            print(f"📊 Status: {payment_status}")
            print(f"🆔 Financial Transaction ID: {financial_txn_id}")
            
            # Explain status
            status_meanings = {
                'PENDING': '⏳ Waiting for user to approve',
                'SUCCESSFUL': '✅ Money moved successfully',
                'FAILED': '❌ Payment failed',
                'TIMEOUT': '⏰ No action by user (expired)'
            }
            
            print(f"📝 Meaning: {status_meanings.get(payment_status, 'Unknown status')}")
            return status_data
        else:
            print("❌ Status check failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error checking payment status: {e}")
        return None

def generate_env_config(api_user_id, api_key):
    """Generate .env configuration"""
    
    print(f"\n📋 Environment Configuration")
    print("=" * 60)
    
    env_config = f"""# MTN Collections API Configuration
MTN_COLLECTION_SUB_KEY={MTN_COLLECTION_SUB_KEY}
MTN_COLLECTION_SUB_KEY_ALT={MTN_COLLECTION_SUB_KEY_ALT}
MTN_API_USER_ID={api_user_id}
MTN_API_KEY={api_key}
MTN_ENV=sandbox
MTN_BASE_URL={MTN_BASE_URL}

# Add these to your backend/.env file
MTN_COLLECTIONS_PRIMARY_KEY={MTN_COLLECTION_SUB_KEY}
MTN_COLLECTIONS_SUB_KEY={MTN_COLLECTION_SUB_KEY}
MTN_USER_ID={api_user_id}
MTN_API_KEY={api_key}
MTN_HOST_NAME=sandbox.momodeveloper.mtn.com
MTN_COLLECTIONS_BASE_URL={MTN_BASE_URL}
MTN_COLLECTIONS_TARGET_ENV=sandbox
"""
    
    print(env_config)
    
    # Save to file
    with open('/Users/chomwashikati/FlashApp/mtn_collections.env', 'w') as f:
        f.write(env_config)
    
    print("💾 Configuration saved to: mtn_collections.env")
    print("\n📝 Next Steps:")
    print("1. Copy the configuration above to your backend/.env file")
    print("2. Restart your backend: docker-compose restart backend")
    print("3. Test payments with your Flash app")

def main():
    """Complete MTN Collections API setup flow"""
    
    print("🚀 Complete MTN Collections API Setup")
    print("=" * 60)
    print(f"Subscription Key: {MTN_COLLECTION_SUB_KEY}")
    print(f"Base URL: {MTN_BASE_URL}")
    print(f"Environment: sandbox")
    
    # Step 1: Create API User
    api_user_id = step_1_create_api_user()
    if not api_user_id:
        print("❌ Setup failed at Step 1")
        return
    
    # Step 2: Create API Key
    api_key = step_2_create_api_key(api_user_id)
    if not api_key:
        print("❌ Setup failed at Step 2")
        return
    
    # Step 3: Get Access Token
    access_token = step_3_get_access_token(api_user_id, api_key)
    if not access_token:
        print("❌ Setup failed at Step 3")
        return
    
    # Step 4: Test Payment Request
    payment_uuid = step_4_request_to_pay(access_token)
    if payment_uuid:
        # Step 5: Check Payment Status
        step_5_check_payment_status(access_token, payment_uuid)
    
    # Generate environment configuration
    generate_env_config(api_user_id, api_key)
    
    print("\n" + "=" * 60)
    print("🎉 MTN Collections API Setup Complete!")
    print("\n✅ Your Flash Payment Orchestrator Flow:")
    print("1. App sends 'pay X to Y' → backend")
    print("2. Backend calls requesttopay")
    print("3. MTN pops MoMo/USSD approval to user")
    print("4. User approves + enters MoMo PIN")
    print("5. Backend polls status or receives callback")
    print("6. App shows receipt & updates history")

if __name__ == '__main__':
    main()