"""
Content Negotiation Tests

Tests for Content-Type and Accept header handling.
"""

import json
from http import HTTPStatus

import pytest
import requests
from expects import be_a, contain, equal, expect, have_key

from src.api_client import RestfulBookerClient
from src.endpoints.booking import BOOKING_ENDPOINT
from tests.data.test_data import (
    ACCEPT_HEADER_SCENARIOS,
    CONTENT_TYPE_SCENARIOS,
    VALID_BOOKING,
)


def describe_content_type_handling():
    """Tests for Content-Type header processing."""

    @pytest.mark.parametrize(
        "scenario",
        [s for s in CONTENT_TYPE_SCENARIOS if s["should_succeed"]],
        ids=[s["name"] for s in CONTENT_TYPE_SCENARIOS if s["should_succeed"]],
    )
    @pytest.mark.regression
    @pytest.mark.validation
    def test_should_accept_valid_content_types(scenario: dict):
        """Verify API accepts valid Content-Type headers."""
        headers = {
            "Content-Type": scenario["content_type"],
            "Accept": "application/json",
        }

        result = requests.post(
            BOOKING_ENDPOINT,
            data=json.dumps(VALID_BOOKING),
            headers=headers,
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.parametrize(
        "scenario",
        [s for s in CONTENT_TYPE_SCENARIOS if not s["should_succeed"]],
        ids=[s["name"] for s in CONTENT_TYPE_SCENARIOS if not s["should_succeed"]],
    )
    @pytest.mark.regression
    @pytest.mark.validation
    @pytest.mark.xfail(reason="API bug: returns 500 instead of 400/415 for invalid content types")
    def test_should_reject_invalid_content_types_gracefully(scenario: dict):
        """Verify API rejects invalid Content-Type headers without crashing."""
        headers = {
            "Content-Type": scenario["content_type"],
            "Accept": "application/json",
        }

        result = requests.post(
            BOOKING_ENDPOINT,
            data=json.dumps(VALID_BOOKING),
            headers=headers,
        )

        # Should return 400 Bad Request or 415 Unsupported Media Type, not 500
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))

    @pytest.mark.regression
    @pytest.mark.validation
    def test_should_accept_json_content_type_with_charset():
        """Verify API accepts application/json with charset parameter."""
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json",
        }

        result = requests.post(
            BOOKING_ENDPOINT,
            data=json.dumps(VALID_BOOKING),
            headers=headers,
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.regression
    @pytest.mark.validation
    @pytest.mark.xfail(reason="API bug: returns 500 for missing Content-Type header")
    def test_should_reject_or_handle_missing_content_type():
        """Verify API handles missing Content-Type header."""
        headers = {"Accept": "application/json"}

        result = requests.post(
            BOOKING_ENDPOINT,
            data=json.dumps(VALID_BOOKING),
            headers=headers,
        )

        # Should return 400 or 415, not 500
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_accept_header_handling():
    """Tests for Accept header content negotiation."""

    @pytest.mark.parametrize(
        "scenario",
        [s for s in ACCEPT_HEADER_SCENARIOS if s["name"] != "text_html"],
        ids=[s["name"] for s in ACCEPT_HEADER_SCENARIOS if s["name"] != "text_html"],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_return_format_based_on_accept_header(
        api_client: RestfulBookerClient, created_booking: dict, scenario: dict
    ):
        """Verify API returns correct format for Accept header."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept=scenario["accept"])

        expect(result.status_code).to(equal(HTTPStatus.OK))

        if scenario["expected_type"] == "xml":
            expect(result.text).to(contain("<"))
        else:
            expect(result.json()).to(be_a(dict))

    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_return_teapot_for_unsupported_accept_header(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify API returns 418 I'm a teapot for unsupported Accept headers."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="text/html")

        # Restful-Booker returns 418 "I'm a teapot" for unsupported Accept headers
        expect(result.status_code).to(equal(HTTPStatus.IM_A_TEAPOT))

    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_return_json_for_wildcard_accept(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify API returns JSON when Accept is */*."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="*/*")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(have_key("firstname"))

    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_return_xml_when_explicitly_requested(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify API returns XML when Accept is application/xml."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="application/xml")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.text).to(contain("<firstname>"))
        expect(result.text).to(contain("<lastname>"))


def describe_response_content_type():
    """Tests for response Content-Type headers."""

    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_return_json_content_type_header(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify response includes correct Content-Type for JSON."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="application/json")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.headers.get("Content-Type")).to(contain("application/json"))

    @pytest.mark.regression
    @pytest.mark.booking
    @pytest.mark.xfail(reason="API bug: returns text/html Content-Type header for XML response")
    def test_should_return_xml_content_type_header(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify response includes correct Content-Type for XML."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="application/xml")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        # May return text/xml or application/xml
        content_type = result.headers.get("Content-Type", "")
        expect(content_type).to(contain("xml"))
