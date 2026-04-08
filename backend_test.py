#!/usr/bin/env python3
"""
Backend API Testing for Evenvy Anti-Bypass Functionality
Tests the /api/quotes/check/{venue_id} endpoint and related authentication flows
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend environment
BASE_URL = "https://party-place-finder.preview.emergentagent.com/api"

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def log_pass(self, test_name):
        print(f"✅ PASS: {test_name}")
        self.passed += 1
    
    def log_fail(self, test_name, error):
        print(f"❌ FAIL: {test_name} - {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return self.failed == 0

def test_anti_bypass_functionality():
    """Test the complete anti-bypass flow for quote checking"""
    results = TestResults()
    
    print("🧪 TESTING ANTI-BYPASS FUNCTIONALITY")
    print(f"Base URL: {BASE_URL}")
    print("="*60)
    
    # Step 1: Get a venue to test with
    print("\n1. Getting test venue...")
    try:
        response = requests.get(f"{BASE_URL}/venues", params={"limit": 1})
        if response.status_code != 200:
            results.log_fail("Get venues", f"Status {response.status_code}: {response.text}")
            return results.summary()
        
        venues = response.json()
        if not venues:
            results.log_fail("Get venues", "No venues found in database")
            return results.summary()
        
        test_venue = venues[0]
        venue_id = test_venue["id"]
        results.log_pass(f"Get test venue (ID: {venue_id})")
        
    except Exception as e:
        results.log_fail("Get venues", str(e))
        return results.summary()
    
    # Step 2: Test unauthenticated access to quote check endpoint
    print("\n2. Testing unauthenticated access to quote check...")
    try:
        response = requests.get(f"{BASE_URL}/quotes/check/{venue_id}")
        if response.status_code == 401:
            results.log_pass("Unauthenticated quote check returns 401")
        else:
            results.log_fail("Unauthenticated quote check", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.log_fail("Unauthenticated quote check", str(e))
    
    # Step 3: Register a test user
    print("\n3. Registering test user...")
    test_user_data = {
        "first_name": "Test",
        "last_name": "User", 
        "email": "antibypass_test@test.com",
        "password": "test123",
        "role": "client"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=test_user_data)
        if response.status_code == 200:
            register_data = response.json()
            auth_token = register_data["token"]
            user_id = register_data["user"]["id"]
            results.log_pass(f"User registration (ID: {user_id})")
        elif response.status_code == 400 and "deja înregistrat" in response.text:
            # User already exists, try to login
            print("   User already exists, attempting login...")
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": test_user_data["email"],
                "password": test_user_data["password"]
            })
            if login_response.status_code == 200:
                login_data = login_response.json()
                auth_token = login_data["token"]
                user_id = login_data["user"]["id"]
                results.log_pass(f"User login (existing user, ID: {user_id})")
            else:
                results.log_fail("User login", f"Status {login_response.status_code}: {login_response.text}")
                return results.summary()
        else:
            results.log_fail("User registration", f"Status {response.status_code}: {response.text}")
            return results.summary()
    except Exception as e:
        results.log_fail("User registration", str(e))
        return results.summary()
    
    # Step 4: Test authenticated quote check (should return has_quote: false initially)
    print("\n4. Testing authenticated quote check (initial state)...")
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/quotes/check/{venue_id}", headers=headers)
        if response.status_code == 200:
            check_data = response.json()
            if check_data.get("has_quote") == False:
                results.log_pass("Initial quote check returns has_quote: false")
            else:
                results.log_fail("Initial quote check", f"Expected has_quote: false, got {check_data}")
        else:
            results.log_fail("Initial quote check", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.log_fail("Initial quote check", str(e))
    
    # Step 5: Create a quote request
    print("\n5. Creating quote request...")
    quote_data = {
        "venue_id": venue_id,
        "event_date": "2025-12-15",
        "guest_count": 100,
        "event_type": "wedding",
        "message": "Test quote for anti-bypass functionality"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/quotes", json=quote_data, headers=headers)
        if response.status_code == 200:
            quote_response = response.json()
            quote_id = quote_response["id"]
            results.log_pass(f"Quote creation (ID: {quote_id})")
        else:
            results.log_fail("Quote creation", f"Status {response.status_code}: {response.text}")
            return results.summary()
    except Exception as e:
        results.log_fail("Quote creation", str(e))
        return results.summary()
    
    # Step 6: Test authenticated quote check again (should return has_quote: true)
    print("\n6. Testing authenticated quote check (after quote creation)...")
    try:
        response = requests.get(f"{BASE_URL}/quotes/check/{venue_id}", headers=headers)
        if response.status_code == 200:
            check_data = response.json()
            if check_data.get("has_quote") == True and check_data.get("quote_id"):
                results.log_pass("Post-quote check returns has_quote: true with quote_id")
            else:
                results.log_fail("Post-quote check", f"Expected has_quote: true with quote_id, got {check_data}")
        else:
            results.log_fail("Post-quote check", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.log_fail("Post-quote check", str(e))
    
    # Step 7: Verify venue details endpoint returns contact info (backend provides it, frontend decides visibility)
    print("\n7. Testing venue details endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/venues/{venue_id}")
        if response.status_code == 200:
            venue_data = response.json()
            # Check if contact fields are present in response
            contact_fields = ["contact_phone", "contact_email", "contact_person"]
            has_contact_info = any(field in venue_data for field in contact_fields)
            if has_contact_info:
                results.log_pass("Venue details includes contact information")
            else:
                results.log_fail("Venue details", "No contact information found in response")
        else:
            results.log_fail("Venue details", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.log_fail("Venue details", str(e))
    
    # Step 8: Test quote check with different user (should return false)
    print("\n8. Testing quote check with different user...")
    different_user_data = {
        "first_name": "Different",
        "last_name": "User",
        "email": "different_user@test.com", 
        "password": "test123",
        "role": "client"
    }
    
    try:
        # Register or login different user
        response = requests.post(f"{BASE_URL}/auth/register", json=different_user_data)
        if response.status_code == 200:
            different_auth_token = response.json()["token"]
        elif response.status_code == 400:
            # Try login
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": different_user_data["email"],
                "password": different_user_data["password"]
            })
            if login_response.status_code == 200:
                different_auth_token = login_response.json()["token"]
            else:
                results.log_fail("Different user setup", f"Login failed: {login_response.text}")
                return results.summary()
        else:
            results.log_fail("Different user setup", f"Registration failed: {response.text}")
            return results.summary()
        
        # Test quote check with different user
        different_headers = {"Authorization": f"Bearer {different_auth_token}"}
        response = requests.get(f"{BASE_URL}/quotes/check/{venue_id}", headers=different_headers)
        if response.status_code == 200:
            check_data = response.json()
            if check_data.get("has_quote") == False:
                results.log_pass("Different user quote check returns has_quote: false")
            else:
                results.log_fail("Different user quote check", f"Expected has_quote: false, got {check_data}")
        else:
            results.log_fail("Different user quote check", f"Status {response.status_code}: {response.text}")
            
    except Exception as e:
        results.log_fail("Different user quote check", str(e))
    
    return results.summary()

def test_additional_auth_endpoints():
    """Test additional authentication-related endpoints"""
    results = TestResults()
    
    print("\n🔐 TESTING ADDITIONAL AUTH ENDPOINTS")
    print("="*60)
    
    # Test /auth/me endpoint
    print("\n1. Testing /auth/me endpoint without authentication...")
    try:
        response = requests.get(f"{BASE_URL}/auth/me")
        if response.status_code == 401:
            results.log_pass("/auth/me returns 401 without auth")
        else:
            results.log_fail("/auth/me without auth", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.log_fail("/auth/me without auth", str(e))
    
    # Test with valid token
    print("\n2. Testing /auth/me with valid authentication...")
    try:
        # Use existing user or create new one
        login_data = {
            "email": "antibypass_test@test.com",
            "password": "test123"
        }
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json()["token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                if "id" in user_data and "email" in user_data and "loyalty_tier" in user_data:
                    results.log_pass("/auth/me returns complete user data")
                else:
                    results.log_fail("/auth/me data", f"Missing required fields in response: {user_data}")
            else:
                results.log_fail("/auth/me with auth", f"Status {response.status_code}: {response.text}")
        else:
            results.log_fail("Login for /auth/me test", f"Status {login_response.status_code}")
    except Exception as e:
        results.log_fail("/auth/me with auth", str(e))
    
    return results.summary()

if __name__ == "__main__":
    print("🚀 STARTING EVENVY ANTI-BYPASS TESTING")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test anti-bypass functionality
    success1 = test_anti_bypass_functionality()
    
    # Test additional auth endpoints
    success2 = test_additional_auth_endpoints()
    
    # Overall result
    overall_success = success1 and success2
    
    print(f"\n🎯 OVERALL RESULT: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    
    sys.exit(0 if overall_success else 1)