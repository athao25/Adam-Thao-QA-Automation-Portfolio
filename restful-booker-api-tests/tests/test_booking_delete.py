"""
Booking Delete Tests

DELETE /booking/:id - Delete a booking
"""

from http import HTTPStatus

import pytest
from expects import equal, expect

from src.api_client import RestfulBookerClient
from tests.data.test_data import VALID_BOOKING


def describe_delete_booking():
    """Tests for DELETE /booking/:id endpoint."""

    @pytest.mark.smoke
    @pytest.mark.booking
    def test_should_delete_booking_with_token_auth(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify booking can be deleted with token authentication."""
        # Create a booking to delete
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]

        # Delete the booking
        result = authenticated_client.delete_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.CREATED))

        # Verify it's deleted
        get_response = authenticated_client.get_booking(booking_id)
        expect(get_response.status_code).to(equal(HTTPStatus.NOT_FOUND))

    @pytest.mark.booking
    def test_should_delete_booking_with_basic_auth(
        api_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify booking can be deleted with Basic authentication."""
        # Create a booking to delete
        create_response = api_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]

        # Delete with basic auth
        result = api_client.delete_booking(booking_id, use_token=False)

        expect(result.status_code).to(equal(HTTPStatus.CREATED))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_return_201_on_successful_delete(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify DELETE returns 201 Created on success."""
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]

        result = authenticated_client.delete_booking(booking_id)

        # Restful-booker returns 201 for successful delete (quirk of the API)
        expect(result.status_code).to(equal(HTTPStatus.CREATED))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_deleted_booking_should_not_be_retrievable(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify deleted booking cannot be retrieved."""
        # Create and delete
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]
        authenticated_client.delete_booking(booking_id)

        # Attempt to retrieve
        result = authenticated_client.get_booking(booking_id)

        expect(result.status_code).to(equal(HTTPStatus.NOT_FOUND))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_deleted_booking_should_not_appear_in_listing(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify deleted booking is removed from booking list."""
        # Create with unique name for filtering
        unique_booking = {
            **valid_booking_data,
            "firstname": "DeleteTest12345",
            "lastname": "UniqueUser12345",
        }
        create_response = authenticated_client.create_booking(unique_booking)
        booking_id = create_response.json()["bookingid"]

        # Delete the booking
        authenticated_client.delete_booking(booking_id)

        # Check it's not in the listing
        list_response = authenticated_client.get_booking_ids(
            firstname="DeleteTest12345",
            lastname="UniqueUser12345",
        )
        booking_ids = [b["bookingid"] for b in list_response.json()]

        expect(booking_id).not_to(be_in(booking_ids))


def describe_delete_authentication_required():
    """Tests verifying DELETE requires authentication."""

    @pytest.mark.booking
    @pytest.mark.auth
    def test_should_reject_delete_without_authentication(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify delete fails without authentication."""
        # Create a booking
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]

        # Attempt delete without auth
        import requests
        from src.endpoints.booking import get_booking_url
        from src.endpoints.config import HEADERS

        result = requests.delete(get_booking_url(booking_id), headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.FORBIDDEN))

        # Cleanup - delete with auth
        authenticated_client.delete_booking(booking_id)

    @pytest.mark.booking
    @pytest.mark.auth
    def test_should_reject_delete_with_invalid_token(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify delete fails with invalid token."""
        # Create a booking
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]

        # Attempt delete with invalid token
        import requests
        from src.endpoints.booking import get_booking_url
        from src.endpoints.config import HEADERS

        headers = {**HEADERS, "Cookie": "token=invalid_token"}
        result = requests.delete(get_booking_url(booking_id), headers=headers)

        expect(result.status_code).to(equal(HTTPStatus.FORBIDDEN))

        # Cleanup
        authenticated_client.delete_booking(booking_id)


def describe_delete_nonexistent_booking():
    """Tests for deleting non-existent bookings."""

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_handle_delete_of_nonexistent_booking(
        authenticated_client: RestfulBookerClient,
    ):
        """Verify deleting non-existent booking returns appropriate error."""
        result = authenticated_client.delete_booking(999999999)

        # API may return 405 or 404 for non-existent resources
        expect(result.status_code).to(be_in([HTTPStatus.NOT_FOUND, HTTPStatus.METHOD_NOT_ALLOWED]))

    @pytest.mark.booking
    @pytest.mark.regression
    def test_should_not_error_on_double_delete(
        authenticated_client: RestfulBookerClient, valid_booking_data: dict
    ):
        """Verify double delete doesn't cause server error."""
        # Create and delete
        create_response = authenticated_client.create_booking(valid_booking_data)
        booking_id = create_response.json()["bookingid"]
        authenticated_client.delete_booking(booking_id)

        # Try to delete again
        result = authenticated_client.delete_booking(booking_id)

        # Should not be 500 (server error)
        expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def describe_delete_edge_cases():
    """Edge case tests for DELETE operations."""

    @pytest.mark.booking
    @pytest.mark.validation
    def test_should_handle_invalid_id_format(authenticated_client: RestfulBookerClient):
        """Verify API handles invalid booking ID formats."""
        import requests
        from src.endpoints.booking import BOOKING_ENDPOINT
        from src.endpoints.auth import get_auth_header

        invalid_ids = ["abc", "12.5", "", " ", "null"]

        for invalid_id in invalid_ids:
            headers = get_auth_header(authenticated_client.token)
            result = requests.delete(f"{BOOKING_ENDPOINT}/{invalid_id}", headers=headers)

            # Should not return 500
            expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))


def be_in(expected_list):
    """Custom matcher for checking if value is in a list."""
    from expects.matchers import Matcher

    class BeIn(Matcher):
        def _match(self, actual):
            return actual in expected_list, []

        def _description(self, *args):
            return f"be in {expected_list}"

    return BeIn()
