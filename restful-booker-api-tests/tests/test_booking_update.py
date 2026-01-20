"""
Booking Update Tests

PUT   /booking/:id - Full update
PATCH /booking/:id - Partial update
"""

from http import HTTPStatus

import pytest
from expects import be_a, equal, expect, have_key, have_keys
from jsonschema import validate

from src.api_client import RestfulBookerClient
from src.schemas import BOOKING_SCHEMA
from tests.data.test_data import VALID_BOOKING, PARTIAL_UPDATE_SCENARIOS


def describe_full_update_booking():
    """Tests for PUT /booking/:id endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_update_booking_with_token_auth(
        authenticated_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify booking can be fully updated with token authentication."""
        booking_id = created_booking["bookingid"]
        updated_data = {
            "firstname": "UpdatedFirst",
            "lastname": "UpdatedLast",
            "totalprice": 999,
            "depositpaid": False,
            "bookingdates": {"checkin": "2025-01-01", "checkout": "2025-01-10"},
            "additionalneeds": "Updated needs",
        }

        result = authenticated_client.update_booking(booking_id, updated_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        updated_booking = result.json()
        expect(updated_booking["firstname"]).to(equal("UpdatedFirst"))
        expect(updated_booking["lastname"]).to(equal("UpdatedLast"))
        expect(updated_booking["totalprice"]).to(equal(999))

    @pytest.mark.booking
    def test_should_update_booking_with_basic_auth(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify booking can be updated with Basic authentication."""
        booking_id = created_booking["bookingid"]
        updated_data = {
            "firstname": "BasicAuthFirst",
            "lastname": "BasicAuthLast",
            "totalprice": 500,
            "depositpaid": True,
            "bookingdates": {"checkin": "2025-02-01", "checkout": "2025-02-05"},
        }

        result = api_client.update_booking(booking_id, updated_data, use_token=False)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        updated_booking = result.json()
        expect(updated_booking["firstname"]).to(equal("BasicAuthFirst"))

    @pytest.mark.booking
    @pytest.mark.schema
    def test_should_return_valid_schema_after_update(
        authenticated_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify response matches booking schema after update."""
        booking_id = created_booking["bookingid"]

        result = authenticated_client.update_booking(booking_id, VALID_BOOKING)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        validate(instance=result.json(), schema=BOOKING_SCHEMA)

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_persist_updated_data(
        authenticated_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify updated data persists and can be retrieved."""
        booking_id = created_booking["bookingid"]
        updated_data = {
            "firstname": "Persisted",
            "lastname": "Update",
            "totalprice": 777,
            "depositpaid": True,
            "bookingdates": {"checkin": "2025-03-01", "checkout": "2025-03-15"},
        }

        # Update the booking
        authenticated_client.update_booking(booking_id, updated_data)

        # Retrieve and verify
        result = authenticated_client.get_booking(booking_id)
        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking = result.json()
        expect(booking["firstname"]).to(equal("Persisted"))
        expect(booking["totalprice"]).to(equal(777))


def describe_full_update_authentication_required():
    """Tests verifying PUT requires authentication."""

    @pytest.mark.booking
    @pytest.mark.auth
    def test_should_reject_update_without_authentication(
        fresh_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify update fails without authentication."""
        booking_id = created_booking["bookingid"]

        # Make raw request without auth
        import requests
        from src.endpoints.booking import get_booking_url
        from src.endpoints.config import HEADERS

        result = requests.put(
            get_booking_url(booking_id),
            json=VALID_BOOKING,
            headers=HEADERS,
        )

        expect(result.status_code).to(equal(HTTPStatus.FORBIDDEN))

    @pytest.mark.booking
    @pytest.mark.auth
    def test_should_reject_update_with_invalid_token(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify update fails with invalid token."""
        booking_id = created_booking["bookingid"]

        import requests
        from src.endpoints.booking import get_booking_url
        from src.endpoints.config import HEADERS

        headers = {**HEADERS, "Cookie": "token=invalid_token_12345"}
        result = requests.put(
            get_booking_url(booking_id),
            json=VALID_BOOKING,
            headers=headers,
        )

        expect(result.status_code).to(equal(HTTPStatus.FORBIDDEN))


def describe_partial_update_booking():
    """Tests for PATCH /booking/:id endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_partially_update_booking(
        authenticated_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify partial update works with token authentication."""
        booking_id = created_booking["bookingid"]
        original_lastname = created_booking["booking"]["lastname"]

        partial_data = {"firstname": "PartiallyUpdated"}

        result = authenticated_client.partial_update_booking(booking_id, partial_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        updated_booking = result.json()
        expect(updated_booking["firstname"]).to(equal("PartiallyUpdated"))
        # Other fields should remain unchanged
        expect(updated_booking["lastname"]).to(equal(original_lastname))

    @pytest.mark.booking
    @pytest.mark.regression
    @pytest.mark.parametrize(
        "scenario",
        PARTIAL_UPDATE_SCENARIOS,
        ids=[s["name"] for s in PARTIAL_UPDATE_SCENARIOS],
    )
    def test_should_update_individual_fields(
        authenticated_client: RestfulBookerClient,
        created_booking: dict,
        scenario: dict,
    ):
        """Verify individual fields can be updated via PATCH."""
        booking_id = created_booking["bookingid"]

        result = authenticated_client.partial_update_booking(booking_id, scenario["data"])

        expect(result.status_code).to(equal(HTTPStatus.OK))

        updated_booking = result.json()
        field = scenario["field_to_verify"]
        expect(updated_booking[field]).to(equal(scenario["data"][field]))

    @pytest.mark.booking
    def test_should_update_nested_bookingdates(
        authenticated_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify bookingdates can be partially updated."""
        booking_id = created_booking["bookingid"]

        partial_data = {
            "bookingdates": {"checkin": "2026-01-01", "checkout": "2026-01-15"}
        }

        result = authenticated_client.partial_update_booking(booking_id, partial_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        updated_booking = result.json()
        expect(updated_booking["bookingdates"]["checkin"]).to(equal("2026-01-01"))
        expect(updated_booking["bookingdates"]["checkout"]).to(equal("2026-01-15"))


def describe_partial_update_authentication_required():
    """Tests verifying PATCH requires authentication."""

    @pytest.mark.booking
    @pytest.mark.auth
    def test_should_reject_partial_update_without_authentication(
        fresh_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify partial update fails without authentication."""
        booking_id = created_booking["bookingid"]

        import requests
        from src.endpoints.booking import get_booking_url
        from src.endpoints.config import HEADERS

        result = requests.patch(
            get_booking_url(booking_id),
            json={"firstname": "Unauthorized"},
            headers=HEADERS,
        )

        expect(result.status_code).to(equal(HTTPStatus.FORBIDDEN))


def describe_update_nonexistent_booking():
    """Tests for updating non-existent bookings."""

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_not_found_for_full_update(
        authenticated_client: RestfulBookerClient,
    ):
        """Verify 405 is returned when updating non-existent booking."""
        result = authenticated_client.update_booking(999999999, VALID_BOOKING)

        # API may return 405 Method Not Allowed for non-existent resources
        expect(result.status_code).to(be_in([HTTPStatus.NOT_FOUND, HTTPStatus.METHOD_NOT_ALLOWED]))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_not_found_for_partial_update(
        authenticated_client: RestfulBookerClient,
    ):
        """Verify error is returned when partially updating non-existent booking."""
        result = authenticated_client.partial_update_booking(
            999999999, {"firstname": "Test"}
        )

        expect(result.status_code).to(be_in([HTTPStatus.NOT_FOUND, HTTPStatus.METHOD_NOT_ALLOWED]))


def be_in(expected_list):
    """Custom matcher for checking if value is in a list."""
    from expects.matchers import Matcher

    class BeIn(Matcher):
        def _match(self, actual):
            return actual in expected_list, []

        def _description(self, *args):
            return f"be in {expected_list}"

    return BeIn()
