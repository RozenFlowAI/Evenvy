#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Lumina Event Venue Marketplace
Tests all endpoints according to the test plan in test_result.md
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import time

# Backend URL from frontend .env
BASE_URL = "https://party-place-finder.preview.emergentagent.com/api"

class LuminaAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.client_token = None
        self.owner_token = None
        self.client_user = None
        self.owner_user = None
        self.test_venue_id = None
        self.test_quote_id = None
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def test_health(self):
        """Test health endpoint"""
        self.log("Testing health endpoint...")
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Health check passed: {data}")
                return True
            else:
                self.log(f"❌ Health check failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Health check error: {str(e)}", "ERROR")
            return False
    
    def test_user_registration(self):
        """Test user registration for both client and owner"""
        self.log("Testing user registration...")
        
        # Generate unique emails
        client_email = f"client_{uuid.uuid4().hex[:8]}@test.com"
        owner_email = f"owner_{uuid.uuid4().hex[:8]}@test.com"
        
        # Test client registration
        client_data = {
            "first_name": "Maria",
            "last_name": "Popescu",
            "email": client_email,
            "password": "SecurePass123!",
            "phone": "+40721234567",
            "role": "client"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=client_data)
            if response.status_code == 200:
                data = response.json()
                self.client_token = data.get("token")
                self.client_user = data.get("user")
                self.log(f"✅ Client registration successful: {self.client_user['email']}")
                
                # Verify loyalty tier is included
                if "loyalty_tier" in self.client_user:
                    self.log(f"✅ Client loyalty tier: {self.client_user['loyalty_tier']}")
                else:
                    self.log("❌ Client loyalty tier missing", "ERROR")
                    return False
            else:
                self.log(f"❌ Client registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Client registration error: {str(e)}", "ERROR")
            return False
        
        # Test owner registration
        owner_data = {
            "first_name": "Ion",
            "last_name": "Georgescu",
            "email": owner_email,
            "password": "OwnerPass123!",
            "phone": "+40722345678",
            "role": "owner"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/register", json=owner_data)
            if response.status_code == 200:
                data = response.json()
                self.owner_token = data.get("token")
                self.owner_user = data.get("user")
                self.log(f"✅ Owner registration successful: {self.owner_user['email']}")
                
                # Verify loyalty tier is included
                if "loyalty_tier" in self.owner_user:
                    self.log(f"✅ Owner loyalty tier: {self.owner_user['loyalty_tier']}")
                else:
                    self.log("❌ Owner loyalty tier missing", "ERROR")
                    return False
                    
                return True
            else:
                self.log(f"❌ Owner registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Owner registration error: {str(e)}", "ERROR")
            return False
    
    def test_user_login(self):
        """Test user login"""
        self.log("Testing user login...")
        
        if not self.client_user or not self.owner_user:
            self.log("❌ Cannot test login - users not registered", "ERROR")
            return False
        
        # Test client login
        client_login_data = {
            "email": self.client_user["email"],
            "password": "SecurePass123!"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=client_login_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user = data.get("user")
                if token and user and "loyalty_tier" in user:
                    self.log(f"✅ Client login successful with loyalty tier: {user['loyalty_tier']}")
                else:
                    self.log("❌ Client login missing token or loyalty tier", "ERROR")
                    return False
            else:
                self.log(f"❌ Client login failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Client login error: {str(e)}", "ERROR")
            return False
        
        # Test owner login
        owner_login_data = {
            "email": self.owner_user["email"],
            "password": "OwnerPass123!"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=owner_login_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user = data.get("user")
                if token and user and "loyalty_tier" in user:
                    self.log(f"✅ Owner login successful with loyalty tier: {user['loyalty_tier']}")
                    return True
                else:
                    self.log("❌ Owner login missing token or loyalty tier", "ERROR")
                    return False
            else:
                self.log(f"❌ Owner login failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Owner login error: {str(e)}", "ERROR")
            return False
    
    def test_auth_me(self):
        """Test /auth/me endpoint"""
        self.log("Testing /auth/me endpoint...")
        
        if not self.client_token:
            self.log("❌ Cannot test /auth/me - no client token", "ERROR")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.client_token}"}
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers)
            if response.status_code == 200:
                user = response.json()
                if "loyalty_tier" in user and "total_requests" in user:
                    self.log(f"✅ /auth/me successful: {user['email']} - {user['loyalty_tier']}")
                    return True
                else:
                    self.log("❌ /auth/me missing loyalty_tier or total_requests", "ERROR")
                    return False
            else:
                self.log(f"❌ /auth/me failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ /auth/me error: {str(e)}", "ERROR")
            return False
    
    def test_venue_creation(self):
        """Test venue creation (owner only)"""
        self.log("Testing venue creation...")
        
        if not self.owner_token:
            self.log("❌ Cannot test venue creation - no owner token", "ERROR")
            return False
        
        venue_data = {
            "name": "Vila Elegance București",
            "description": "O locație de vis pentru evenimente speciale, cu grădină frumoasă și sală elegantă.",
            "rules": "Nu se permite fumatul în interior. Muzica se oprește la 24:00. Parcarea este gratuită pentru invitați.",
            "city": "București",
            "address": "Strada Florilor 123, Sector 1",
            "latitude": 44.4268,
            "longitude": 26.1025,
            "price_per_person": 150.0,
            "price_type": "fixed",
            "capacity_min": 50,
            "capacity_max": 200,
            "event_types": ["wedding", "baptism", "corporate"],
            "style_tags": ["Modern", "Glamour", "Grădină"],
            "amenities": ["Parcare", "Catering inclus", "DJ / Muzică live", "Terasă", "Grădină"],
            "images": ["https://example.com/venue1.jpg", "https://example.com/venue2.jpg"],
            "contact_phone": "+40723456789",
            "contact_email": "contact@vilaelegance.ro",
            "contact_person": "Ana Popescu",
            "commission_tier": "premium"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.post(f"{self.base_url}/venues", json=venue_data, headers=headers)
            if response.status_code == 200:
                venue = response.json()
                self.test_venue_id = venue.get("id")
                
                # Verify all required fields are present
                required_fields = ["id", "name", "rules", "latitude", "longitude", "commission_tier"]
                missing_fields = [field for field in required_fields if field not in venue]
                
                if missing_fields:
                    self.log(f"❌ Venue creation missing fields: {missing_fields}", "ERROR")
                    return False
                
                self.log(f"✅ Venue created successfully: {venue['name']} (ID: {self.test_venue_id})")
                self.log(f"✅ Venue has rules: {venue['rules'][:50]}...")
                self.log(f"✅ Venue GPS: {venue['latitude']}, {venue['longitude']}")
                self.log(f"✅ Commission tier: {venue['commission_tier']}")
                return True
            else:
                self.log(f"❌ Venue creation failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Venue creation error: {str(e)}", "ERROR")
            return False
    
    def test_venue_listing(self):
        """Test venue listing with sorting"""
        self.log("Testing venue listing...")
        
        try:
            # Test basic listing
            response = self.session.get(f"{self.base_url}/venues")
            if response.status_code == 200:
                venues = response.json()
                self.log(f"✅ Venue listing successful: {len(venues)} venues found")
                
                # Test sorting options
                sort_options = ["recommended", "price_asc", "price_desc", "rating", "capacity", "newest"]
                for sort_by in sort_options:
                    response = self.session.get(f"{self.base_url}/venues?sort_by={sort_by}")
                    if response.status_code == 200:
                        sorted_venues = response.json()
                        self.log(f"✅ Sorting by {sort_by}: {len(sorted_venues)} venues")
                    else:
                        self.log(f"❌ Sorting by {sort_by} failed: {response.status_code}", "ERROR")
                        return False
                
                return True
            else:
                self.log(f"❌ Venue listing failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Venue listing error: {str(e)}", "ERROR")
            return False
    
    def test_venue_details(self):
        """Test getting single venue details"""
        self.log("Testing venue details...")
        
        if not self.test_venue_id:
            self.log("❌ Cannot test venue details - no venue ID", "ERROR")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/venues/{self.test_venue_id}")
            if response.status_code == 200:
                venue = response.json()
                self.log(f"✅ Venue details retrieved: {venue['name']}")
                return True
            else:
                self.log(f"❌ Venue details failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Venue details error: {str(e)}", "ERROR")
            return False
    
    def test_venue_update(self):
        """Test venue update (owner only)"""
        self.log("Testing venue update...")
        
        if not self.owner_token or not self.test_venue_id:
            self.log("❌ Cannot test venue update - missing token or venue ID", "ERROR")
            return False
        
        update_data = {
            "description": "Updated description with new amenities and features",
            "price_per_person": 175.0,
            "rules": "Updated rules: No smoking indoors. Music stops at 23:30. Free parking for all guests."
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.put(f"{self.base_url}/venues/{self.test_venue_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                venue = response.json()
                self.log(f"✅ Venue updated successfully: {venue['name']}")
                self.log(f"✅ Updated price: {venue['price_per_person']}")
                return True
            else:
                self.log(f"❌ Venue update failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Venue update error: {str(e)}", "ERROR")
            return False
    
    def test_quote_creation(self):
        """Test quote request creation (client)"""
        self.log("Testing quote creation...")
        
        if not self.client_token or not self.test_venue_id:
            self.log("❌ Cannot test quote creation - missing token or venue ID", "ERROR")
            return False
        
        quote_data = {
            "venue_id": self.test_venue_id,
            "event_type": "wedding",
            "event_date": "2024-08-15",
            "guest_count": 120,
            "message": "Căutăm o locație pentru nunta noastră din august. Avem nevoie de catering complet și decorațiuni.",
            "client_phone": "+40721234567"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.client_token}"}
            response = self.session.post(f"{self.base_url}/quotes", json=quote_data, headers=headers)
            if response.status_code == 200:
                quote = response.json()
                self.test_quote_id = quote.get("id")
                
                # Verify loyalty discount is applied
                if "client_loyalty_tier" in quote and "client_discount" in quote:
                    self.log(f"✅ Quote created with loyalty tier: {quote['client_loyalty_tier']} (discount: {quote['client_discount']}%)")
                    return True
                else:
                    self.log("❌ Quote missing loyalty information", "ERROR")
                    return False
            else:
                self.log(f"❌ Quote creation failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Quote creation error: {str(e)}", "ERROR")
            return False
    
    def test_client_quotes(self):
        """Test client's quote list"""
        self.log("Testing client quotes list...")
        
        if not self.client_token:
            self.log("❌ Cannot test client quotes - no client token", "ERROR")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.client_token}"}
            response = self.session.get(f"{self.base_url}/quotes/mine", headers=headers)
            if response.status_code == 200:
                quotes = response.json()
                self.log(f"✅ Client quotes retrieved: {len(quotes)} quotes")
                return True
            else:
                self.log(f"❌ Client quotes failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Client quotes error: {str(e)}", "ERROR")
            return False
    
    def test_owner_quotes(self):
        """Test owner's received quotes"""
        self.log("Testing owner quotes list...")
        
        if not self.owner_token:
            self.log("❌ Cannot test owner quotes - no owner token", "ERROR")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.get(f"{self.base_url}/quotes/owner", headers=headers)
            if response.status_code == 200:
                quotes = response.json()
                self.log(f"✅ Owner quotes retrieved: {len(quotes)} quotes")
                return True
            else:
                self.log(f"❌ Owner quotes failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Owner quotes error: {str(e)}", "ERROR")
            return False
    
    def test_quote_status_update(self):
        """Test updating quote status"""
        self.log("Testing quote status update...")
        
        if not self.owner_token or not self.test_quote_id:
            self.log("❌ Cannot test quote status update - missing token or quote ID", "ERROR")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.put(f"{self.base_url}/quotes/{self.test_quote_id}/status?status=responded", headers=headers)
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Quote status updated: {result['message']}")
                return True
            else:
                self.log(f"❌ Quote status update failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Quote status update error: {str(e)}", "ERROR")
            return False
    
    def test_promotion_purchase(self):
        """Test purchasing promotion package"""
        self.log("Testing promotion package purchase...")
        
        if not self.owner_token or not self.test_venue_id:
            self.log("❌ Cannot test promotion purchase - missing token or venue ID", "ERROR")
            return False
        
        promotion_data = {
            "venue_id": self.test_venue_id,
            "package": "silver"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.post(f"{self.base_url}/venues/{self.test_venue_id}/promote", json=promotion_data, headers=headers)
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Promotion purchased: {result['message']}")
                if "promotion" in result:
                    promo = result["promotion"]
                    self.log(f"✅ Promotion details: {promo['name']} - boost: {promo['boost']}")
                return True
            else:
                self.log(f"❌ Promotion purchase failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Promotion purchase error: {str(e)}", "ERROR")
            return False
    
    def test_loyalty_endpoints(self):
        """Test loyalty program endpoints"""
        self.log("Testing loyalty endpoints...")
        
        try:
            # Test loyalty tiers endpoint
            response = self.session.get(f"{self.base_url}/loyalty/tiers")
            if response.status_code == 200:
                tiers = response.json()
                self.log(f"✅ Loyalty tiers retrieved: {list(tiers.keys())}")
            else:
                self.log(f"❌ Loyalty tiers failed: {response.status_code} - {response.text}", "ERROR")
                return False
            
            # Test user's loyalty progress
            if self.client_token:
                headers = {"Authorization": f"Bearer {self.client_token}"}
                response = self.session.get(f"{self.base_url}/loyalty/my-progress", headers=headers)
                if response.status_code == 200:
                    progress = response.json()
                    self.log(f"✅ Loyalty progress: {progress['current_tier']['name']} - {progress['total_requests']} requests")
                    return True
                else:
                    self.log(f"❌ Loyalty progress failed: {response.status_code} - {response.text}", "ERROR")
                    return False
            else:
                self.log("❌ Cannot test loyalty progress - no client token", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Loyalty endpoints error: {str(e)}", "ERROR")
            return False
    
    def test_owner_statistics(self):
        """Test owner statistics endpoint"""
        self.log("Testing owner statistics...")
        
        if not self.owner_token:
            self.log("❌ Cannot test owner stats - no owner token", "ERROR")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = self.session.get(f"{self.base_url}/stats/owner", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_venues", "total_quotes", "pending_quotes", "responded_quotes", "total_views"]
                missing_fields = [field for field in required_fields if field not in stats]
                
                if missing_fields:
                    self.log(f"❌ Owner stats missing fields: {missing_fields}", "ERROR")
                    return False
                
                self.log(f"✅ Owner stats: {stats['total_venues']} venues, {stats['total_quotes']} quotes")
                return True
            else:
                self.log(f"❌ Owner stats failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Owner stats error: {str(e)}", "ERROR")
            return False
    
    def test_config_endpoint(self):
        """Test configuration endpoint"""
        self.log("Testing config endpoint...")
        
        try:
            response = self.session.get(f"{self.base_url}/config")
            if response.status_code == 200:
                config = response.json()
                required_sections = ["event_types", "style_tags", "cities", "amenities", "loyalty_tiers", "commission_tiers", "promotion_packages"]
                missing_sections = [section for section in required_sections if section not in config]
                
                if missing_sections:
                    self.log(f"❌ Config missing sections: {missing_sections}", "ERROR")
                    return False
                
                self.log(f"✅ Config retrieved with all sections: {list(config.keys())}")
                return True
            else:
                self.log(f"❌ Config failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Config error: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        self.log("=" * 60)
        self.log("STARTING LUMINA BACKEND API TESTS")
        self.log("=" * 60)
        
        test_results = {}
        
        # Test sequence following the review request flow
        tests = [
            ("Health Check", self.test_health),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Auth Me", self.test_auth_me),
            ("Venue Creation", self.test_venue_creation),
            ("Venue Listing", self.test_venue_listing),
            ("Venue Details", self.test_venue_details),
            ("Venue Update", self.test_venue_update),
            ("Quote Creation", self.test_quote_creation),
            ("Client Quotes", self.test_client_quotes),
            ("Owner Quotes", self.test_owner_quotes),
            ("Quote Status Update", self.test_quote_status_update),
            ("Promotion Purchase", self.test_promotion_purchase),
            ("Loyalty Endpoints", self.test_loyalty_endpoints),
            ("Owner Statistics", self.test_owner_statistics),
            ("Config Endpoint", self.test_config_endpoint)
        ]
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                result = test_func()
                test_results[test_name] = result
                if result:
                    self.log(f"✅ {test_name} PASSED")
                else:
                    self.log(f"❌ {test_name} FAILED")
            except Exception as e:
                self.log(f"❌ {test_name} ERROR: {str(e)}", "ERROR")
                test_results[test_name] = False
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Summary
        self.log("\n" + "=" * 60)
        self.log("TEST SUMMARY")
        self.log("=" * 60)
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED!")
            return True
        else:
            self.log(f"⚠️  {total - passed} tests failed")
            return False

if __name__ == "__main__":
    tester = LuminaAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)