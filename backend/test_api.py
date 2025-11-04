#!/usr/bin/env python3
"""
Simple script to test Flash backend API endpoints
Run with: python test_api.py
"""

import requests
import json
import sys

BASE_URL = 'http://localhost:8002/api'

def test_api_health():
    """Test if API is responding"""
    try:
        response = requests.get(f'{BASE_URL}/auth/me/', timeout=5)
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("✅ API is responding")
            return True
        else:
            print(f"❌ API returned {response.status_code}")
            return False
    except requests.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        print("Run: docker-compose up -d")
        return False
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    try:
        test_data = {
            'phone_number': '+260971234567',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'full_name': 'Test User'
        }
        
        response = requests.post(f'{BASE_URL}/auth/register/', json=test_data)
        
        if response.status_code == 201:
            print("✅ User registration working")
            return response.json()
        elif response.status_code == 400:
            # User might already exist
            print("⚠️  User registration returned 400 (user might exist)")
            return None
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return None

def test_user_login():
    """Test user login endpoint"""
    try:
        login_data = {
            'phone_number': '+260971234567',
            'password': 'testpass123'
        }
        
        response = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
        
        if response.status_code == 200:
            print("✅ User login working")
            return response.json().get('token')
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return None
            
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return None

def test_wallet_endpoint(token):
    """Test wallet endpoint with authentication"""
    try:
        headers = {'Authorization': f'Token {token}'}
        response = requests.get(f'{BASE_URL}/transactions/wallet/', headers=headers)
        
        if response.status_code == 200:
            print("✅ Wallet endpoint working")
            wallet_data = response.json()
            print(f"   Balance: {wallet_data.get('escrow_balance', 0)} ZMW")
            return True
        else:
            print(f"❌ Wallet endpoint failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Wallet test failed: {e}")
        return False

def test_send_money_endpoint(token):
    """Test send money endpoint"""
    try:
        headers = {'Authorization': f'Token {token}'}
        payment_data = {
            'recipient_phone': '+260977654321',
            'amount': 50.00,
            'description': 'Test payment from API script'
        }
        
        response = requests.post(f'{BASE_URL}/transactions/send/', 
                               json=payment_data, headers=headers)
        
        if response.status_code in [200, 201]:
            print("✅ Send money endpoint working")
            result = response.json()
            print(f"   Transaction ID: {result.get('transaction_id')}")
            return True
        else:
            print(f"❌ Send money failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Send money test failed: {e}")
        return False

def main():
    """Run all API tests"""
    print("🧪 Testing Flash Backend API")
    print("=" * 40)
    
    # Test 1: API Health
    if not test_api_health():
        sys.exit(1)
    
    # Test 2: User Registration
    user_data = test_user_registration()
    
    # Test 3: User Login
    token = test_user_login()
    if not token:
        print("❌ Cannot proceed without auth token")
        sys.exit(1)
    
    # Test 4: Wallet Endpoint
    test_wallet_endpoint(token)
    
    # Test 5: Send Money (this will test MTN API integration)
    test_send_money_endpoint(token)
    
    print("\n" + "=" * 40)
    print("✅ API Testing Complete!")
    print("\nNext steps:")
    print("1. Test mobile app connection")
    print("2. Verify MTN sandbox credentials")
    print("3. Test payment flows end-to-end")

if __name__ == '__main__':
    main()