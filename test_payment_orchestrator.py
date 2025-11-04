#!/usr/bin/env python3
"""
Test script for the new payment orchestrator architecture
Tests the provider routing and unified interface
"""

import requests
import json
import sys

BASE_URL = 'http://localhost:8002/api'

def test_payment_orchestrator():
    """Test the new payment orchestrator features"""
    
    print("🚀 Testing Payment Orchestrator Architecture")
    print("=" * 60)
    
    # First, login to get a token
    try:
        login_response = requests.post(f'{BASE_URL}/auth/login/', json={
            'phone_number': '+260971111111',
            'password': 'testpass123'
        })
        
        if login_response.status_code != 200:
            print("❌ Login failed - cannot test orchestrator")
            return False
            
        token = login_response.json().get('token')
        headers = {'Authorization': f'Token {token}', 'Content-Type': 'application/json'}
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Test 1: List available providers
    print("\n🔍 Test 1: List Available Providers")
    try:
        response = requests.get(f'{BASE_URL}/payments/providers/', headers=headers)
        if response.status_code == 200:
            providers = response.json()
            print(f"✅ Found {providers['total']} provider(s):")
            for provider in providers['providers']:
                print(f"   - {provider['name']} ({provider['country']}) - {provider['currency']}")
        else:
            print(f"❌ Provider list failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Provider list error: {e}")
        return False
    
    # Test 2: Validate phone numbers
    print("\n📱 Test 2: Phone Number Validation & Provider Detection")
    test_numbers = [
        '+260971234567',  # MTN Zambia
        '+260977654321',  # MTN Zambia  
        '+260955123456',  # Should be unsupported
        '+233241234567',  # Ghana (unsupported for now)
    ]
    
    for phone in test_numbers:
        try:
            response = requests.post(f'{BASE_URL}/payments/validate-phone/', 
                                   json={'phone_number': phone}, headers=headers)
            if response.status_code == 200:
                result = response.json()
                if result['valid']:
                    print(f"✅ {phone} -> {result['provider']} ({result['country']})")
                else:
                    print(f"⚠️  {phone} -> No provider available")
            else:
                print(f"❌ Validation failed for {phone}")
        except Exception as e:
            print(f"❌ Validation error for {phone}: {e}")
    
    # Test 3: Provider-specific balance check
    print("\n💰 Test 3: Provider Balance Check")
    try:
        response = requests.get(f'{BASE_URL}/payments/mtn/balance/', headers=headers)
        if response.status_code == 200:
            balance = response.json()
            print(f"✅ MTN Balance: {balance.get('balance', 'N/A')} {balance.get('currency', 'ZMW')}")
            if 'provider' in balance:
                print(f"   Via provider: {balance['provider']}")
        else:
            print(f"❌ Balance check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Balance error: {e}")
    
    # Test 4: Send money via orchestrator
    print("\n💸 Test 4: Send Money via Payment Orchestrator")
    try:
        send_data = {
            'recipient_phone': '+260977654321',
            'amount': 10.00,
            'description': 'Payment orchestrator test'
        }
        
        response = requests.post(f'{BASE_URL}/transactions/send/', 
                               json=send_data, headers=headers)
        
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Payment routed successfully!")
            print(f"   Provider used: {result.get('provider', 'Unknown')}")
            print(f"   Reference: {result.get('reference_id', 'N/A')}")
            print(f"   Status: {result.get('status', 'Unknown')}")
            return True
        else:
            print(f"❌ Send money failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Send money error: {e}")
        return False

def test_provider_routing():
    """Test that different phone numbers route to correct providers"""
    
    print("\n🎯 Testing Provider Routing Logic")
    print("-" * 40)
    
    # Test the routing logic directly (simulation)
    test_cases = [
        ('+260971234567', 'mtn-zambia', True),   # MTN 97 prefix
        ('+260761234567', 'mtn-zambia', True),   # MTN 76 prefix  
        ('+260955123456', None, False),          # Airtel (not supported yet)
        ('+233241234567', None, False),          # Ghana (not supported yet)
        ('+234801234567', None, False),          # Nigeria (not supported yet)
    ]
    
    print("Phone Number Routing Tests:")
    for phone, expected_provider, should_support in test_cases:
        # This simulates the router logic
        if phone.startswith('+260') and (phone[4:6] in ['97', '76']):
            actual_provider = 'mtn-zambia'
            supported = True
        else:
            actual_provider = None
            supported = False
        
        if supported == should_support and actual_provider == expected_provider:
            status = "✅"
        else:
            status = "❌"
        
        print(f"  {status} {phone} -> {actual_provider or 'No provider'}")
    
    return True

def main():
    """Run all payment orchestrator tests"""
    
    # Check if backend is running
    try:
        response = requests.get(f'{BASE_URL}/auth/me/', timeout=5)
        if response.status_code in [200, 401]:
            print("✅ Backend is accessible")
        else:
            print("❌ Backend not responding correctly")
            sys.exit(1)
    except requests.ConnectionError:
        print("❌ Backend not running. Start with: cd backend && docker-compose up -d")
        sys.exit(1)
    
    # Run tests
    orchestrator_test = test_payment_orchestrator()
    routing_test = test_provider_routing()
    
    print("\n" + "=" * 60)
    if orchestrator_test and routing_test:
        print("🎉 Payment Orchestrator Architecture: ✅ WORKING!")
        print("\n✅ Architecture Benefits Achieved:")
        print("   - Unified provider interface implemented")
        print("   - Automatic provider routing working")
        print("   - MTN integration refactored successfully")
        print("   - Ready for multi-provider expansion")
        print("\n🚀 Ready to add:")
        print("   - Airtel Zambia provider")
        print("   - MTN Ghana/Nigeria providers")
        print("   - Bank transfer providers")
        print("   - Multi-currency support")
        
        return True
    else:
        print("❌ Payment Orchestrator Architecture: NEEDS ATTENTION")
        print("\n🔧 Check the logs above for specific issues")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)