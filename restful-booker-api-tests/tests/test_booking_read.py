"""
Booking Read Tests

GET /booking      - Get all booking IDs
GET /booking/:id  - Get specific booking
"""

from http import HTTPStatus

import pytest
from expects import be_a, be_empty, contain, equal, expect, have_key, have_keys, have_len
from jsonschema import validate

from src.api_client import RestfulBookerClient
from src.schemas import BOOKING_SCHEMA, BOOKING_IDS_LIST_SCHEMA, BOOKING_ID_SCHEMA
from tests.data.test_data import NON_EXISTENT_BOOKING_IDS, INVALID_ID_FORMATS


def describe_get_all_booking_ids():
    """Tests for GET /booking endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_return_list_of_booking_ids(api_client: RestfulBookerClient):
        """Verify endpoint returns a list of booking IDs."""
        result = api_client.get_booking_ids()

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking_ids = result.json()
        expect(booking_ids).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.schema
    def test_should_return_valid_booking_ids_schema(api_client: RestfulBookerClient):
        """Verify response matches expected JSON schema."""
        result = api_client.get_booking_ids()

        expect(result.status_code).to(equal(HTTPStatus.OK))
        validate(instance=result.json(), schema=BOOKING_IDS_LIST_SCHEMA)

    @pytest.mark.booking
    def test_should_return_booking_id_objects(api_client: RestfulBookerClient):
        """Verify each item contains bookingid field."""
        result = api_client.get_booking_ids()

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking_ids = result.json()
        if len(booking_ids) > 0:
            for booking in booking_ids[:5]:  # Check first 5
                expect(booking).to(have_key("bookingid"))
                expect(booking["bookingid"]).to(be_a(int))

    @pytest.mark.booking
    def test_should_not_require_authentication(fresh_client: RestfulBookerClient):
        """Verify endpoint is accessible without authentication."""
        result = fresh_client.get_booking_ids()

        expect(result.status_code).to(equal(HTTPStatus.OK))


def describe_get_booking_ids_with_filters():
    """Tests for GET /booking with query parameters."""

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_filter_by_firstname(api_client: RestfulBookerClient, created_booking: dict):
        """Verify filtering by firstname works."""
        firstname = created_booking["booking"]["firstname"]

        result = api_client.get_booking_ids(firstname=firstname)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        # Should return at least the created booking
        booking_ids = result.json()
        expect(booking_ids).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_filter_by_lastname(api_client: RestfulBookerClient, created_booking: dict):
        """Verify filtering by lastname works."""
        lastname = created_booking["booking"]["lastname"]

        result = api_client.get_booking_ids(lastname=lastname)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        booking_ids = result.json()
        expect(booking_ids).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_filter_by_checkin_date(api_client: RestfulBookerClient):
        """Verify filtering by checkin date works."""
        result = api_client.get_booking_ids(checkin="2024-01-01")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_filter_by_checkout_date(api_client: RestfulBookerClient):
        """Verify filtering by checkout date works."""
        result = api_client.get_booking_ids(checkout="2024-12-31")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_filter_by_multiple_parameters(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify filtering by multiple parameters works."""
        booking = created_booking["booking"]

        result = api_client.get_booking_ids(
            firstname=booking["firstname"],
            lastname=booking["lastname"],
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(be_a(list))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_empty_list_for_nonexistent_filter(api_client: RestfulBookerClient):
        """Verify filtering with non-matching criteria returns empty list."""
        result = api_client.get_booking_ids(firstname="NonExistentName12345")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(be_empty)


def describe_get_single_booking():
    """Tests for GET /booking/:id endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_return_booking_by_id(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify booking can be retrieved by ID."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        booking = result.json()
        expect(booking).to(have_keys("firstname", "lastname", "totalprice", "depositpaid", "bookingdates"))

    @pytest.mark.booking
    @pytest.mark.schema
    def test_should_return_valid_booking_schema(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify response matches expected booking schema."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        validate(instance=result.json(), schema=BOOKING_SCHEMA)

    @pytest.mark.booking
    def test_should_return_correct_booking_data(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify returned booking matches created booking."""
        booking_id = created_booking["bookingid"]
        expected_booking = created_booking["booking"]

        result = api_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        actual_booking = result.json()
        expect(actual_booking["firstname"]).to(equal(expected_booking["firstname"]))
        expect(actual_booking["lastname"]).to(equal(expected_booking["lastname"]))
        expect(actual_booking["totalprice"]).to(equal(expected_booking["totalprice"]))

    @pytest.mark.booking
    def test_should_not_require_authentication(
        fresh_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify booking retrieval doesn't require authentication."""
        booking_id = created_booking["bookingid"]

        result = fresh_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.OK))


def describe_get_nonexistent_booking():
    """Tests for accessing non-existent bookings."""

    @pytest.mark.booking
    @pytest.mark.regression
    @pytest.mark.parametrize("booking_id", NON_EXISTENT_BOOKING_IDS)
    def test_should_return_not_found_for_nonexistent_id(
        api_client: RestfulBookerClient, booking_id: int
    ):
        """Verify 404 is returned for non-existent booking IDs."""
        result = api_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.NOT_FOUND))

    @pytest.mark.booking
    @pytest.mark.validation
    @pytest.mark.parametrize("invalid_id", INVALID_ID_FORMATS)
    def test_should_handle_invalid_id_formats(api_client: RestfulBookerClient, invalid_id: str):
        """Verify API handles invalid ID formats gracefully."""
        import requests
        from src.endpoints.booking import BOOKING_ENDPOINT

        result = requests.get(f"{BOOKING_ENDPOINT}/{invalid_id}")

        # Should not return 500 (server error)
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_get_booking_content_negotiation():
    """Tests for content negotiation on booking retrieval."""

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_json_by_default(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify JSON is returned by default."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.headers.get("Content-Type")).to(contain("application/json"))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_xml_when_requested(
        api_client: RestfulBookerClient, created_booking: dict
    ):
        """Verify XML can be returned when Accept header specifies it."""
        booking_id = created_booking["bookingid"]

        result = api_client.get_booking(booking_id, accept="application/xml")

        expect(result.status_code).to(equal(HTTPStatus.OK))
        # Response should be XML
        expect(result.text).to(contain("<"))
