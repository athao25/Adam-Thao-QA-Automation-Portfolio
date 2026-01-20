"""
Pytest Configuration and Fixtures

Shared fixtures for all API tests.
"""

import pytest
from faker import Faker

from src.api_client import RestfulBookerClient

fake = Faker()


# ==================== Client Fixtures ====================


@pytest.fixture(scope="session")
def api_client() -> RestfulBookerClient:
    """Create a session-scoped API client."""
    return RestfulBookerClient()


@pytest.fixture(scope="session")
def authenticated_client() -> RestfulBookerClient:
    """Create an authenticated API client with valid token."""
    client = RestfulBookerClient()
    client.authenticate()
    return client


@pytest.fixture
def fresh_client() -> RestfulBookerClient:
    """Create a fresh API client for each test."""
    return RestfulBookerClient()


# ==================== Test Data Fixtures ====================


@pytest.fixture
def valid_booking_data() -> dict:
    """Generate valid booking data."""
    return {
        "firstname": fake.first_name(),
        "lastname": fake.last_name(),
        "totalprice": fake.random_int(min=50, max=500),
        "depositpaid": fake.boolean(),
        "bookingdates": {
            "checkin": "2024-01-01",
            "checkout": "2024-01-10",
        },
        "additionalneeds": fake.random_element(["Breakfast", "Lunch", "Dinner", "Parking", None]),
    }


@pytest.fixture
def minimal_booking_data() -> dict:
    """Generate minimal valid booking data (required fields only)."""
    return {
        "firstname": "John",
        "lastname": "Doe",
        "totalprice": 100,
        "depositpaid": True,
        "bookingdates": {
            "checkin": "2024-02-01",
            "checkout": "2024-02-05",
        },
    }


@pytest.fixture
def booking_with_additional_needs() -> dict:
    """Booking data with additional needs specified."""
    return {
        "firstname": "Jane",
        "lastname": "Smith",
        "totalprice": 250,
        "depositpaid": False,
        "bookingdates": {
            "checkin": "2024-03-15",
            "checkout": "2024-03-20",
        },
        "additionalneeds": "Breakfast and late checkout",
    }


@pytest.fixture
def valid_credentials() -> dict:
    """Valid authentication credentials."""
    return {"username": "admin", "password": "password123"}


@pytest.fixture
def invalid_credentials() -> dict:
    """Invalid authentication credentials."""
    return {"username": "invalid_user", "password": "wrong_password"}


# ==================== Booking Management Fixtures ====================


@pytest.fixture
def created_booking(authenticated_client, valid_booking_data) -> dict:
    """Create a booking and return its data including ID."""
    response = authenticated_client.create_booking(valid_booking_data)
    assert response.status_code == 200
    data = response.json()
    yield {
        "bookingid": data["bookingid"],
        "booking": data["booking"],
    }
    # Cleanup: Delete the booking after test
    try:
        authenticated_client.delete_booking(data["bookingid"])
    except Exception:
        pass  # Ignore cleanup errors


@pytest.fixture
def multiple_bookings(authenticated_client) -> list:
    """Create multiple bookings and return their IDs."""
    booking_ids = []
    for i in range(3):
        booking_data = {
            "firstname": f"Test{i}",
            "lastname": f"User{i}",
            "totalprice": 100 + (i * 50),
            "depositpaid": i % 2 == 0,
            "bookingdates": {
                "checkin": f"2024-0{i+1}-01",
                "checkout": f"2024-0{i+1}-10",
            },
        }
        response = authenticated_client.create_booking(booking_data)
        if response.status_code == 200:
            booking_ids.append(response.json()["bookingid"])

    yield booking_ids

    # Cleanup
    for booking_id in booking_ids:
        try:
            authenticated_client.delete_booking(booking_id)
        except Exception:
            pass
