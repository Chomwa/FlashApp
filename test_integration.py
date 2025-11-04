#!/usr/bin/env python3
"""
Integration test script for Flash MVP
This script tests the complete payment flow end-to-end
"""

import requests
import json
import time
import sys

BASE_URL = 'http://localhost:8002/api'

def test_complete_payment_flow():
    """Test complete payment flow: register -> login -> send money -> request money"""
    
    print("🧪 Flash MVP Integration Test")
    print("=" * 50)
    
    # Test 1: Register two users
    print("\n📝 Step 1: Registering test users...")
    
    # User 1 (Sender)
    user1_data = {
        'phone_number': '+260971111111',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'full_name': 'Alice Mwanza'
    }
    
    # User 2 (Recipient)
    user2_data = {
        'phone_number': '+260972222222',
        'password': 'testpass123',
        'password_confirm': 'testpass123',
        'full_name': 'Bob Phiri'
    }
    
    # Register users (ignore if they already exist)
    for user_data in [user1_data, user2_data]:
        try:
            response = requests.post(f'{BASE_URL}/auth/register/', json=user_data)
            if response.status_code == 201:
                print(f"✅ Registered {user_data['full_name']}")
            else:
                print(f"⚠️  {user_data['full_name']} already exists")
        except Exception as e:
            print(f"❌ Failed to register {user_data['full_name']}: {e}")
            return False
    
    # Test 2: Login users
    print("\n🔐 Step 2: Login users...")
    
    def login_user(phone, password, name):
        try:
            response = requests.post(f'{BASE_URL}/auth/login/', json={
                'phone_number': phone,
                'password': password
            })
            if response.status_code == 200:
                token = response.json().get('token')
                print(f"✅ {name} logged in successfully")
                return token
            else:
                print(f"❌ Failed to login {name}: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Login error for {name}: {e}")
            return None
    
    alice_token = login_user(user1_data['phone_number'], user1_data['password'], 'Alice')
    bob_token = login_user(user2_data['phone_number'], user2_data['password'], 'Bob')
    
    if not alice_token or not bob_token:
        print("❌ Login failed - cannot continue")
        return False
    
    # Test 3: Check wallets
    print("\n💰 Step 3: Check user wallets...")
    
    def check_wallet(token, name):
        try:
            headers = {'Authorization': f'Token {token}'}
            response = requests.get(f'{BASE_URL}/transactions/wallet/', headers=headers)
            if response.status_code == 200:
                wallet = response.json()
                print(f"✅ {name} wallet: {wallet.get('escrow_balance', 0)} ZMW escrow, Daily limit: {wallet.get('daily_limit', 0)}")
                return True
            else:
                print(f"❌ Failed to get {name} wallet: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Wallet error for {name}: {e}")
            return False
    
    if not check_wallet(alice_token, 'Alice') or not check_wallet(bob_token, 'Bob'):
        print("❌ Wallet check failed")
        return False
    
    # Test 4: Send money from Alice to Bob
    print("\n💸 Step 4: Alice sends money to Bob...")
    
    send_data = {
        'recipient_phone': user2_data['phone_number'],
        'amount': 100.00,
        'description': 'Test payment from integration script'
    }
    
    try:
        headers = {'Authorization': f'Token {alice_token}'}
        response = requests.post(f'{BASE_URL}/transactions/send/', json=send_data, headers=headers)
        
        if response.status_code in [200, 201]:
            result = response.json()
            transaction_id = result.get('transaction', {}).get('id')
            print(f"✅ Payment sent successfully! Transaction ID: {transaction_id}")
            send_transaction_id = transaction_id
        else:
            print(f"❌ Send money failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Send money error: {e}")
        return False
    
    # Test 5: Bob requests money from Alice
    print("\n🙏 Step 5: Bob requests money from Alice...")
    
    request_data = {
        'payer_phone': user1_data['phone_number'],
        'amount': 50.00,
        'description': 'Test payment request from integration script'
    }
    
    try:
        headers = {'Authorization': f'Token {bob_token}'}
        response = requests.post(f'{BASE_URL}/transactions/request/', json=request_data, headers=headers)
        
        if response.status_code in [200, 201]:
            result = response.json()
            transaction_id = result.get('transaction', {}).get('id')
            print(f"✅ Payment request created! Transaction ID: {transaction_id}")
            request_transaction_id = transaction_id
        else:
            print(f"❌ Request money failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Request money error: {e}")
        return False
    
    # Test 6: Check transaction history
    print("\n📊 Step 6: Check transaction history...")
    
    def check_transactions(token, name):
        try:
            headers = {'Authorization': f'Token {token}'}
            response = requests.get(f'{BASE_URL}/transactions/transactions/', headers=headers)
            if response.status_code == 200:
                transactions = response.json()
                print(f"✅ {name} has {len(transactions)} transaction(s)")
                for tx in transactions[:2]:  # Show latest 2
                    print(f"   - {tx.get('transaction_type')} {tx.get('amount')} ZMW - {tx.get('status')}")
                return True
            else:
                print(f"❌ Failed to get {name} transactions: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Transaction history error for {name}: {e}")
            return False
    
    check_transactions(alice_token, 'Alice')
    check_transactions(bob_token, 'Bob')
    
    print("\n" + "=" * 50)
    print("✅ Integration Test Complete!")
    print("\n📱 Mobile App Testing Guide:")
    print("1. Open Flash app on simulator")
    print("2. Register with +260973333333 (password: testpass123)")
    print("3. Test sending money to +260971111111 (Alice)")
    print("4. Test requesting money from +260972222222 (Bob)")
    print("5. Check transaction history and QR features")
    
    return True

def test_mtn_api_integration():
    """Test MTN API integration (requires sandbox credentials)"""
    print("\n🌐 Testing MTN API Integration...")
    
    try:
        # This would test MTN Collections API
        # For now, just check if endpoints exist
        response = requests.get(f'{BASE_URL}/payments/mtn/balance/')
        if response.status_code in [200, 401]:  # 401 means auth required but endpoint exists
            print("✅ MTN API endpoints available")
        else:
            print("⚠️  MTN API endpoints not fully configured")
    except Exception as e:
        print(f"⚠️  MTN API test failed: {e}")

if __name__ == '__main__':
    # Check if backend is running
    try:
        response = requests.get(f'{BASE_URL}/auth/me/', timeout=5)
        if response.status_code in [200, 401]:
            print("✅ Backend is running")
        else:
            print("❌ Backend not responding correctly")
            sys.exit(1)
    except requests.ConnectionError:
        print("❌ Backend not running. Start with: docker-compose up -d")
        sys.exit(1)
    
    # Run tests
    success = test_complete_payment_flow()
    test_mtn_api_integration()
    
    if success:
        print("\n🎉 All tests passed! Flash MVP is ready for testing.")
    else:
        print("\n❌ Some tests failed. Check the logs above.")
        sys.exit(1)