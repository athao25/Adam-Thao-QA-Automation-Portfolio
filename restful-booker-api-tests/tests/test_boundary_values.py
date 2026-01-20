"""
Boundary Value Tests

Tests for numeric boundaries, string lengths, and edge case values.
"""

from http import HTTPStatus

import pytest
from expects import equal, expect, have_key

from src.api_client import RestfulBookerClient
from tests.data.test_data import (
    PRICE_BOUNDARY_SCENARIOS,
    STRING_LENGTH_SCENARIOS,
    VALID_BOOKING,
)


def describe_price_boundaries():
    """Tests for totalprice field boundary values."""

    @pytest.mark.parametrize(
        "scenario",
        PRICE_BOUNDARY_SCENARIOS,
        ids=[s["name"] for s in PRICE_BOUNDARY_SCENARIOS],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_handle_price_boundary_value(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API handles price values at boundaries."""
        booking = {**VALID_BOOKING, "totalprice": scenario["price"]}

        result = api_client.create_booking(booking)

        if scenario["should_succeed"]:
            expect(result.status_code).to(equal(HTTPStatus.OK))
            expect(result.json()).to(have_key("bookingid"))
        else:
            expect(result.status_code).not_to(equal(HTTPStatus.OK))

    @pytest.mark.parametrize(
        "price,expected_stored",
        [
            (0, 0),
            (1, 1),
            (100, 100),
            (99999, 99999),
        ],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_store_price_accurately(
        api_client: RestfulBookerClient, price: int, expected_stored: int
    ):
        """Verify price values are stored correctly."""
        booking = {**VALID_BOOKING, "totalprice": price}

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()["booking"]["totalprice"]).to(equal(expected_stored))


def describe_string_length_boundaries():
    """Tests for string field length boundaries."""

    @pytest.mark.parametrize(
        "scenario",
        STRING_LENGTH_SCENARIOS,
        ids=[s["name"] for s in STRING_LENGTH_SCENARIOS],
    )
    @pytest.mark.regression
    @pytest.mark.validation
    def test_should_handle_firstname_length_boundary(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API handles various firstname lengths."""
        booking = {**VALID_BOOKING, "firstname": scenario["value"]}

        result = api_client.create_booking(booking)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.parametrize(
        "scenario",
        STRING_LENGTH_SCENARIOS,
        ids=[s["name"] for s in STRING_LENGTH_SCENARIOS],
    )
    @pytest.mark.regression
    @pytest.mark.validation
    def test_should_handle_lastname_length_boundary(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API handles various lastname lengths."""
        booking = {**VALID_BOOKING, "lastname": scenario["value"]}

        result = api_client.create_booking(booking)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.parametrize(
        "scenario",
        STRING_LENGTH_SCENARIOS,
        ids=[s["name"] for s in STRING_LENGTH_SCENARIOS],
    )
    @pytest.mark.regression
    @pytest.mark.validation
    def test_should_handle_additionalneeds_length_boundary(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API handles various additionalneeds lengths."""
        booking = {**VALID_BOOKING, "additionalneeds": scenario["value"]}

        result = api_client.create_booking(booking)

        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_combined_boundary_tests():
    """Tests combining multiple boundary conditions."""

    @pytest.mark.parametrize("price", [0, 1, 100, 99999])
    @pytest.mark.parametrize("deposit", [True, False])
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_create_booking_with_price_and_deposit_combinations(
        api_client: RestfulBookerClient, price: int, deposit: bool
    ):
        """Verify bookings created with various price/deposit combinations."""
        booking = {
            **VALID_BOOKING,
            "totalprice": price,
            "depositpaid": deposit,
        }

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        created = result.json()["booking"]
        expect(created["totalprice"]).to(equal(price))
        expect(created["depositpaid"]).to(equal(deposit))
