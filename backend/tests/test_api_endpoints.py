"""Backend API endpoint tests for Lumina Event Venue Booking App

Tests cover:
- Health check
- Auth (register, login)
- Venues (list, featured, detail, CRUD)
- Bookings (create, list)
- Event types
- Reviews
"""

import pytest
import requests
import uuid


class TestHealth:
    """Health check endpoint"""

    def test_health_check(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestAuth:
    """Authentication endpoints"""

    def test_login_demo_user(self, base_url, api_client):
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "user@lumina.com", "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "user@lumina.com"
        assert data["user"]["role"] == "user"

    def test_login_demo_owner(self, base_url, api_client):
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "owner@lumina.com", "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == "owner@lumina.com"
        assert data["user"]["role"] == "owner"

    def test_login_invalid_credentials(self, base_url, api_client):
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "invalid@test.com", "password": "wrongpass"}
        )
        assert response.status_code == 401

    def test_register_new_user(self, base_url, api_client):
        unique_email = f"TEST_user_{uuid.uuid4().hex[:8]}@test.com"
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json={
                "name": "Test User",
                "email": unique_email,
                "password": "testpass123",
                "role": "user"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["role"] == "user"

    def test_register_duplicate_email(self, base_url, api_client):
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json={
                "name": "Duplicate User",
                "email": "user@lumina.com",
                "password": "testpass123",
                "role": "user"
            }
        )
        assert response.status_code == 400

    def test_get_me_with_token(self, base_url, api_client, demo_user_token):
        response = api_client.get(
            f"{base_url}/api/auth/me",
            headers={"Authorization": f"Bearer {demo_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user@lumina.com"
        assert "password" not in data

    def test_get_me_without_token(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/auth/me")
        assert response.status_code == 401


class TestVenues:
    """Venue endpoints"""

    def test_list_venues(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify venue structure
        venue = data[0]
        assert "id" in venue
        assert "name" in venue
        assert "location" in venue
        assert "price_per_event" in venue
        assert "capacity" in venue
        assert "event_types" in venue
        assert "images" in venue
        assert "_id" not in venue  # MongoDB _id should be excluded

    def test_featured_venues(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues/featured")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Check if venues are featured or high-rated
        for venue in data:
            assert "id" in venue
            assert "name" in venue

    def test_get_venue_detail(self, base_url, api_client):
        # First get a venue ID
        list_response = api_client.get(f"{base_url}/api/venues")
        venues = list_response.json()
        venue_id = venues[0]["id"]
        
        # Get venue detail
        response = api_client.get(f"{base_url}/api/venues/{venue_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == venue_id
        assert "name" in data
        assert "description" in data
        assert "owner_id" in data

    def test_get_venue_not_found(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues/nonexistent-id-12345")
        assert response.status_code == 404

    def test_filter_venues_by_event_type(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues?event_type=wedding")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify filtered venues have wedding in event_types
        for venue in data:
            assert "wedding" in venue["event_types"]

    def test_filter_venues_by_price(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues?price_min=2000&price_max=4000")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for venue in data:
            assert 2000 <= venue["price_per_event"] <= 4000

    def test_filter_venues_by_capacity(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues?capacity_min=100&capacity_max=300")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for venue in data:
            assert 100 <= venue["capacity"] <= 300

    def test_search_venues_by_name(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/venues?search=Palatul")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find venues with "Palatul" in name
        if len(data) > 0:
            assert any("Palatul" in v["name"] for v in data)


class TestEventTypes:
    """Event types endpoint"""

    def test_get_event_types(self, base_url, api_client):
        response = api_client.get(f"{base_url}/api/event-types")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify structure
        event_type = data[0]
        assert "id" in event_type
        assert "label" in event_type
        assert "icon" in event_type
        # Check for expected event types
        event_ids = [et["id"] for et in data]
        assert "wedding" in event_ids
        assert "corporate" in event_ids


class TestBookings:
    """Booking endpoints (requires auth)"""

    def test_create_booking_authenticated(self, base_url, api_client, demo_user_token):
        # Get a venue first
        venues_response = api_client.get(f"{base_url}/api/venues")
        venues = venues_response.json()
        venue_id = venues[0]["id"]
        
        # Create booking
        response = api_client.post(
            f"{base_url}/api/bookings",
            json={
                "venue_id": venue_id,
                "event_date": "2026-06-15",
                "guest_count": 100,
                "event_type": "wedding",
                "message": "TEST booking for testing purposes"
            },
            headers={"Authorization": f"Bearer {demo_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["venue_id"] == venue_id
        assert data["guest_count"] == 100
        assert data["status"] == "pending"
        assert "id" in data
        
        # Verify booking was persisted by fetching user's bookings
        get_response = api_client.get(
            f"{base_url}/api/bookings/mine",
            headers={"Authorization": f"Bearer {demo_user_token}"}
        )
        assert get_response.status_code == 200
        bookings = get_response.json()
        assert any(b["id"] == data["id"] for b in bookings)

    def test_create_booking_unauthenticated(self, base_url, api_client):
        response = api_client.post(
            f"{base_url}/api/bookings",
            json={
                "venue_id": "some-venue-id",
                "event_date": "2026-06-15",
                "guest_count": 100,
                "event_type": "wedding"
            }
        )
        assert response.status_code == 401

    def test_get_my_bookings(self, base_url, api_client, demo_user_token):
        response = api_client.get(
            f"{base_url}/api/bookings/mine",
            headers={"Authorization": f"Bearer {demo_user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_owner_bookings(self, base_url, api_client, demo_owner_token):
        response = api_client.get(
            f"{base_url}/api/bookings/owner",
            headers={"Authorization": f"Bearer {demo_owner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestReviews:
    """Review endpoints"""

    def test_get_venue_reviews(self, base_url, api_client):
        # Get a venue first
        venues_response = api_client.get(f"{base_url}/api/venues")
        venues = venues_response.json()
        venue_id = venues[0]["id"]
        
        response = api_client.get(f"{base_url}/api/reviews/venue/{venue_id}")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_review_authenticated(self, base_url, api_client, demo_user_token):
        # Get a venue
        venues_response = api_client.get(f"{base_url}/api/venues")
        venues = venues_response.json()
        # Use a venue that user hasn't reviewed yet (try last one)
        venue_id = venues[-1]["id"]
        
        response = api_client.post(
            f"{base_url}/api/reviews",
            json={
                "venue_id": venue_id,
                "rating": 5,
                "comment": "TEST review - excellent venue!"
            },
            headers={"Authorization": f"Bearer {demo_user_token}"}
        )
        # May be 200 or 400 if already reviewed
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert data["venue_id"] == venue_id
            assert data["rating"] == 5


class TestOwnerVenues:
    """Owner venue management endpoints"""

    def test_get_owner_venues(self, base_url, api_client, demo_owner_token):
        response = api_client.get(
            f"{base_url}/api/venues/owner/mine",
            headers={"Authorization": f"Bearer {demo_owner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0  # Demo owner should have venues

    def test_get_owner_stats(self, base_url, api_client, demo_owner_token):
        response = api_client.get(
            f"{base_url}/api/stats/owner",
            headers={"Authorization": f"Bearer {demo_owner_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_venues" in data
        assert "total_bookings" in data
        assert "pending_bookings" in data
        assert "confirmed_bookings" in data
        assert isinstance(data["total_venues"], int)
