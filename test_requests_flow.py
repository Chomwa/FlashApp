#!/usr/bin/env python3
"""
Test script for complete payment request end-to-end flow
Tests: Create request → List requests → Approve/Decline requests
"""

import requests
import json
import sys

# Backend API base URL
BASE_URL = "http://localhost:8002/api"

class FlashAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.user1_token = None
        self.user2_token = None
        
    def test_complete_flow(self):
        """Test complete payment request flow"""
        print("🚀 Testing Complete Payment Request Flow")
        print("=" * 50)
        
        try:
            # Step 1: Create/Login test users
            print("\n1️⃣ Setting up test users...")
            self.setup_test_users()
            
            # Step 2: Create payment request
            print("\n2️⃣ Creating payment request...")
            request_data = self.create_payment_request()
            
            # Step 3: List payment requests
            print("\n3️⃣ Listing payment requests...")
            self.list_payment_requests()
            
            # Step 4: Test approve request (from user1 perspective)
            print("\n4️⃣ Testing approve payment request...")
            self.test_approve_request(request_data)
            
            # Step 5: Create another request for decline test
            print("\n5️⃣ Testing decline payment request...")
            decline_request = self.create_payment_request()
            self.test_decline_request(decline_request)
            
            print("\n✅ All tests passed! Payment request system is production ready.")
            
        except Exception as e:
            print(f"\n❌ Test failed: {str(e)}")
            sys.exit(1)
    
    def setup_test_users(self):
        """Create or login test users"""
        # User 1 (will pay requests - sender perspective) - Create new user
        user1_data = {
            "phone_number": "+260971234567",
            "password": "password123", 
            "password_confirm": "password123",
            "full_name": "Test Payer"
        }
        
        # User 2 (will create requests - recipient perspective) - Create new user
        user2_data = {
            "phone_number": "+260976543210",
            "password": "password123",
            "password_confirm": "password123",
            "full_name": "Test Requester"
        }
        
        # Try to register users, ignore if they already exist
        for user_data in [user1_data, user2_data]:
            try:
                response = self.session.post(f"{BASE_URL}/auth/register/", json=user_data)
                if response.status_code == 201:
                    print(f"✅ Registered user: {user_data['phone_number']}")
                elif response.status_code == 400:
                    print(f"👤 User already exists: {user_data['phone_number']}")
                else:
                    print(f"❌ Registration failed ({response.status_code}): {response.text}")
            except Exception as e:
                print(f"❌ Registration error: {e}")
        
        # Login users  
        login1_response = self.session.post(f"{BASE_URL}/auth/login/", json={
            "phone_number": "+260971234567",
            "password": "password123"
        })
        
        login2_response = self.session.post(f"{BASE_URL}/auth/login/", json={
            "phone_number": "+260976543210",
            "password": "password123"
        })
        
        if login1_response.status_code == 200:
            self.user1_token = login1_response.json()['token']
            print(f"🔑 User1 login successful: {self.user1_token[:20]}...")
        else:
            raise Exception(f"User1 login failed: {login1_response.text}")
            
        if login2_response.status_code == 200:
            self.user2_token = login2_response.json()['token']
            print(f"🔑 User2 login successful: {self.user2_token[:20]}...")
        else:
            raise Exception(f"User2 login failed: {login2_response.text}")
    
    def create_payment_request(self):
        """Create a payment request from user2 to user1"""
        request_data = {
            "payer_phone": "+260971234567",  # User1 will pay
            "amount": 25.00,
            "description": "Test payment request for lunch",
            "expires_in_hours": 24
        }
        
        headers = {"Authorization": f"Token {self.user2_token}"}
        response = self.session.post(
            f"{BASE_URL}/transactions/request/", 
            json=request_data,
            headers=headers
        )
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Payment request created: {result['transaction']['id']}")
            print(f"📄 QR Code available: {'qr_code' in result}")
            return result
        else:
            raise Exception(f"Failed to create payment request: {response.text}")
    
    def list_payment_requests(self):
        """List payment requests for both users"""
        # User1 perspective (received requests)
        headers1 = {"Authorization": f"Token {self.user1_token}"}
        response1 = self.session.get(f"{BASE_URL}/transactions/p2p/", headers=headers1)
        
        # User2 perspective (sent requests)
        headers2 = {"Authorization": f"Token {self.user2_token}"}
        response2 = self.session.get(f"{BASE_URL}/transactions/p2p/", headers=headers2)
        
        if response1.status_code == 200 and response2.status_code == 200:
            user1_requests = response1.json()
            user2_requests = response2.json()
            
            print(f"📋 User1 requests (received): {len(user1_requests)} items")
            print(f"📋 User2 requests (sent): {len(user2_requests)} items")
            
            # Filter for payment requests only
            user1_payment_requests = [r for r in user1_requests if isinstance(r, dict) and r.get('is_payment_request')]
            user2_payment_requests = [r for r in user2_requests if isinstance(r, dict) and r.get('is_payment_request')]
            
            print(f"💰 User1 payment requests: {len(user1_payment_requests)}")
            print(f"💰 User2 payment requests: {len(user2_payment_requests)}")
            
            return user1_payment_requests, user2_payment_requests
        else:
            raise Exception(f"Failed to list requests: User1={response1.status_code}, User2={response2.status_code}")
    
    def test_approve_request(self, request_data):
        """Test approving a payment request"""
        p2p_id = request_data['p2p_details']['id']
        
        headers = {"Authorization": f"Token {self.user1_token}"}  # User1 approves
        response = self.session.post(
            f"{BASE_URL}/transactions/p2p/{p2p_id}/approve/",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Payment request approved: {result['message']}")
            print(f"🔄 Provider: {result.get('provider', 'Unknown')}")
            print(f"📝 Status: {result.get('status', 'Unknown')}")
        else:
            raise Exception(f"Failed to approve request: {response.text}")
    
    def test_decline_request(self, request_data):
        """Test declining a payment request"""
        p2p_id = request_data['p2p_details']['id']
        
        decline_data = {
            "reason": "Not enough funds right now"
        }
        
        headers = {"Authorization": f"Token {self.user1_token}"}  # User1 declines
        response = self.session.post(
            f"{BASE_URL}/transactions/p2p/{p2p_id}/decline/",
            json=decline_data,
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"❌ Payment request declined: {result['message']}")
        else:
            raise Exception(f"Failed to decline request: {response.text}")

if __name__ == "__main__":
    tester = FlashAPITester()
    tester.test_complete_flow()