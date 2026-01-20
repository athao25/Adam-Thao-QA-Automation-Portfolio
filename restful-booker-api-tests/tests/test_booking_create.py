"""
Booking Creation Tests

POST /booking - Create new bookings
"""

from http import HTTPStatus

import pytest
from expects import be_a, be_true, contain, equal, expect, have_key, have_keys
from jsonschema import validate

from src.api_client import RestfulBookerClient
from src.schemas import BOOKING_RESPONSE_SCHEMA, BOOKING_SCHEMA
from tests.data.test_data import (
    VALID_BOOKING,
    BOOKING_WITHOUT_ADDITIONAL_NEEDS,
    BOOKING_WITH_ZERO_PRICE,
    BOOKING_WITH_HIGH_PRICE,
)


def describe_create_booking():
    """Tests for POST /booking endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_create_booking_with_valid_data(
        api_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify successful booking creation with valid data."""
        result = api_client.create_booking(valid_booking_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        response_data = result.json()
        expect(response_data).to(have_key("bookingid"))
        expect(response_data).to(have_key("booking"))
        expect(response_data["bookingid"]).to(be_a(int))

    @pytest.mark.booking
    @pytest.mark.schema
    def test_should_return_valid_response_schema(
        api_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify response matches expected JSON schema."""
        result = api_client.create_booking(valid_booking_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        validate(instance=result.json(), schema=BOOKING_RESPONSE_SCHEMA)

    @pytest.mark.booking
    def test_should_return_booking_details_in_response(
        api_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify response contains all submitted booking details."""
        result = api_client.create_booking(valid_booking_data)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking = result.json()["booking"]
        expect(booking["firstname"]).to(equal(valid_booking_data["firstname"]))
        expect(booking["lastname"]).to(equal(valid_booking_data["lastname"]))
        expect(booking["totalprice"]).to(equal(valid_booking_data["totalprice"]))
        expect(booking["depositpaid"]).to(equal(valid_booking_data["depositpaid"]))
        expect(booking["bookingdates"]["checkin"]).to(
            equal(valid_booking_data["bookingdates"]["checkin"])
        )
        expect(booking["bookingdates"]["checkout"]).to(
            equal(valid_booking_data["bookingdates"]["checkout"])
        )

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_create_booking_without_additional_needs(api_client: RestfulBookerClient):
        """Verify booking can be created without additionalneeds field."""
        result = api_client.create_booking(BOOKING_WITHOUT_ADDITIONAL_NEEDS)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(have_key("bookingid"))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_create_booking_with_zero_price(api_client: RestfulBookerClient):
        """Verify booking can be created with zero total price."""
        result = api_client.create_booking(BOOKING_WITH_ZERO_PRICE)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking = result.json()["booking"]
        expect(booking["totalprice"]).to(equal(0))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_create_booking_with_high_price(api_client: RestfulBookerClient):
        """Verify booking can be created with high total price."""
        result = api_client.create_booking(BOOKING_WITH_HIGH_PRICE)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking = result.json()["booking"]
        expect(booking["totalprice"]).to(equal(BOOKING_WITH_HIGH_PRICE["totalprice"]))

    @pytest.mark.booking
    def test_should_generate_unique_booking_ids(api_client: RestfulBookerClient):
        """Verify each booking gets a unique ID."""
        result1 = api_client.create_booking(VALID_BOOKING)
        result2 = api_client.create_booking(VALID_BOOKING)

        expect(result1.status_code).to(equal(HTTPStatus.OK))
        expect(result2.status_code).to(equal(HTTPStatus.OK))

        id1 = result1.json()["bookingid"]
        id2 = result2.json()["bookingid"]

        expect(id1).not_to(equal(id2))


def describe_create_booking_without_authentication():
    """Tests verifying booking creation doesn't require auth."""

    @pytest.mark.booking
    def test_should_create_booking_without_token(fresh_client: RestfulBookerClient):
        """Verify bookings can be created without authentication token."""
        expect(fresh_client.token).to(equal(None))

        result = fresh_client.create_booking(VALID_BOOKING)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(have_key("bookingid"))


def describe_create_booking_data_types():
    """Tests for various data types in booking creation."""

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_boolean_depositpaid_true(api_client: RestfulBookerClient):
        """Verify depositpaid accepts boolean true."""
        booking = {**VALID_BOOKING, "depositpaid": True}
        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()["booking"]["depositpaid"]).to(be_true)

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_boolean_depositpaid_false(api_client: RestfulBookerClient):
        """Verify depositpaid accepts boolean false."""
        booking = {**VALID_BOOKING, "depositpaid": False}
        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()["booking"]["depositpaid"]).to(equal(False))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_special_characters_in_names(api_client: RestfulBookerClient):
        """Verify names can contain special characters."""
        booking = {
            **VALID_BOOKING,
            "firstname": "Mary-Jane",
            "lastname": "O'Connor",
        }
        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        response_booking = result.json()["booking"]
        expect(response_booking["firstname"]).to(equal("Mary-Jane"))
        expect(response_booking["lastname"]).to(equal("O'Connor"))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_unicode_characters(api_client: RestfulBookerClient):
        """Verify booking handles unicode characters."""
        booking = {
            **VALID_BOOKING,
            "firstname": "José",
            "lastname": "García",
            "additionalneeds": "Café and croissant",
        }
        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_long_additional_needs(api_client: RestfulBookerClient):
        """Verify additionalneeds can handle long strings."""
        long_needs = "Breakfast, " * 50  # Long string
        booking = {**VALID_BOOKING, "additionalneeds": long_needs}
        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
