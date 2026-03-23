import pytest
import requests
import os

@pytest.fixture(scope="session")
def base_url():
    """Get base URL from environment"""
    # For backend tests, use localhost since we're testing from within the container
    return "http://localhost:8001"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def demo_user_token(base_url):
    """Login as demo user and return token"""
    response = requests.post(
        f"{base_url}/api/auth/login",
        json={"email": "user@lumina.com", "password": "password123"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        pytest.skip("Demo user login failed")
    return response.json()["token"]

@pytest.fixture(scope="session")
def demo_owner_token(base_url):
    """Login as demo owner and return token"""
    response = requests.post(
        f"{base_url}/api/auth/login",
        json={"email": "owner@lumina.com", "password": "password123"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        pytest.skip("Demo owner login failed")
    return response.json()["token"]
