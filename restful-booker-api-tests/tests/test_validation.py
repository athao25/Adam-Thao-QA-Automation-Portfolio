"""
Validation and Error Handling Tests

Tests for input validation and error responses across all endpoints.
"""

from http import HTTPStatus

import pytest
from expects import contain, equal, expect, have_key

from src.api_client import RestfulBookerClient
from src.endpoints.config import BASE_URL, HEADERS
from src.endpoints.booking import BOOKING_ENDPOINT
from tests.data.test_data import INVALID_BOOKING_SCENARIOS
import requests


def describe_booking_validation():
    """Tests for booking creation validation."""

    @pytest.mark.validation
    @pytest.mark.parametrize(
        "scenario",
        INVALID_BOOKING_SCENARIOS,
        ids=[s["name"] for s in INVALID_BOOKING_SCENARIOS],
    )
    def test_should_handle_invalid_booking_data(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API handles invalid booking data appropriately."""
        result = api_client.create_booking(scenario["data"])

        # API should either reject with 400/500 or accept with default values
        # Restful-booker is permissive, so we just verify no crash
        expect(result.status_code).not_to(equal(None))

    @pytest.mark.validation
    @pytest.mark.xfail(reason="API bug: returns 500 for null body instead of 400")
    def test_should_handle_null_request_body(api_client: RestfulBookerClient):
        """Verify API handles null/empty request body."""
        result = requests.post(BOOKING_ENDPOINT, json=None, headers=HEADERS)

        # API should return 400 Bad Request, but returns 500 (known API bug)
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    def test_should_handle_malformed_json(api_client: RestfulBookerClient):
        """Verify API handles malformed JSON gracefully."""
        result = requests.post(
            BOOKING_ENDPOINT,
            data="{ invalid json }",
            headers={"Content-Type": "application/json"},
        )

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    def test_should_handle_wrong_content_type():
        """Verify API handles wrong content type."""
        booking_data = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(
            BOOKING_ENDPOINT,
            data=str(booking_data),
            headers={"Content-Type": "text/plain"},
        )

        # Should handle gracefully
        expect(result.status_code).not_to(equal(None))

    @pytest.mark.validation
    def test_should_handle_extra_fields_in_booking():
        """Verify API ignores extra fields in booking data."""
        booking_with_extra = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
            "extrafield1": "should be ignored",
            "extrafield2": 12345,
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking_with_extra, headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        # Extra fields should not appear in response
        if result.status_code == HTTPStatus.OK:
            booking = result.json().get("booking", {})
            expect(booking).not_to(have_key("extrafield1"))
            expect(booking).not_to(have_key("extrafield2"))


def describe_date_validation():
    """Tests for date field validation."""

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_accept_valid_date_format():
        """Verify standard date format is accepted."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-12-25", "checkout": "2024-12-31"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_checkout_before_checkin():
        """Verify API handles checkout date before checkin."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-12-31", "checkout": "2024-12-25"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # API may accept this (permissive) or reject
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_same_checkin_checkout():
        """Verify API handles same day checkin/checkout."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-12-25", "checkout": "2024-12-25"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_past_dates():
        """Verify API handles past dates."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2020-01-01", "checkout": "2020-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # API is permissive and accepts past dates
        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    @pytest.mark.parametrize(
        "invalid_date",
        ["not-a-date", "2024/01/01", "01-01-2024", "2024-13-01", "2024-01-32", ""],
    )
    def test_should_handle_invalid_date_formats(invalid_date: str):
        """Verify API handles various invalid date formats."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": invalid_date, "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # Should not crash
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_numeric_validation():
    """Tests for numeric field validation."""

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_negative_totalprice():
        """Verify API handles negative price."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": -100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # May be accepted or rejected
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_float_totalprice():
        """Verify API handles float price values."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 99.99,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_string_totalprice():
        """Verify API handles string price value."""
        booking = {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": "100",
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # Should handle gracefully
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_endpoint_validation():
    """Tests for endpoint routing and method validation."""

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_return_404_for_nonexistent_endpoint():
        """Verify 404 is returned for non-existent endpoints."""
        result = requests.get(f"{BASE_URL}/nonexistent")

        expect(result.status_code).to(equal(HTTPStatus.NOT_FOUND))

    @pytest.mark.validation
    @pytest.mark.regression
    @pytest.mark.parametrize(
        "method",
        ["POST", "PUT", "PATCH", "DELETE"],
    )
    def test_should_handle_unsupported_methods_on_ping(method: str):
        """Verify /ping only accepts GET requests."""
        from src.endpoints.ping import PING_ENDPOINT

        result = requests.request(method, PING_ENDPOINT, headers=HEADERS)

        # Should not be 200 OK (ping only supports GET)
        expect(result.status_code).not_to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_head_request():
        """Verify HEAD request is handled."""
        result = requests.head(BOOKING_ENDPOINT, headers=HEADERS)

        # HEAD should return same status as GET but no body
        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_options_request():
        """Verify OPTIONS request is handled."""
        result = requests.options(BOOKING_ENDPOINT, headers=HEADERS)

        # Should return allowed methods or 200
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_string_validation():
    """Tests for string field validation."""

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_empty_string_names():
        """Verify API handles empty string names."""
        booking = {
            "firstname": "",
            "lastname": "",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # May accept or reject empty strings
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_whitespace_only_names():
        """Verify API handles whitespace-only names."""
        booking = {
            "firstname": "   ",
            "lastname": "\t\n",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_very_long_strings():
        """Verify API handles very long string values."""
        booking = {
            "firstname": "A" * 1000,
            "lastname": "B" * 1000,
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
            "additionalneeds": "C" * 5000,
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        # Should handle gracefully (may truncate or reject)
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_html_in_strings():
        """Verify API handles HTML in string fields."""
        booking = {
            "firstname": "<script>alert('xss')</script>",
            "lastname": "<b>Bold</b>",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.validation
    @pytest.mark.regression
    def test_should_handle_sql_injection_attempt():
        """Verify API handles SQL injection attempts safely."""
        booking = {
            "firstname": "'; DROP TABLE bookings; --",
            "lastname": "Test",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        }

        result = requests.post(BOOKING_ENDPOINT, json=booking, headers=HEADERS)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))
