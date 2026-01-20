"""
API Client for Restful-Booker API

This module provides a clean interface for interacting with the Restful-Booker API.
Encapsulates all HTTP operations and authentication handling.
"""

from typing import Optional
import requests

from src.endpoints.config import HEADERS
from src.endpoints.auth import (
    AUTH_ENDPOINT,
    DEFAULT_USERNAME,
    DEFAULT_PASSWORD,
    get_auth_header,
    get_basic_auth_header,
)
from src.endpoints.booking import BOOKING_ENDPOINT, get_booking_url
from src.endpoints.ping import PING_ENDPOINT


class RestfulBookerClient:
    """Client for interacting with the Restful-Booker API."""

    def __init__(self):
        self.session = requests.Session()
        self.token: Optional[str] = None

    # ==================== Authentication ====================

    def create_token(
        self,
        username: str = DEFAULT_USERNAME,
        password: str = DEFAULT_PASSWORD,
    ) -> requests.Response:
        """
        Create authentication token.

        POST /auth
        """
        payload = {"username": username, "password": password}
        response = self.session.post(AUTH_ENDPOINT, json=payload, headers=HEADERS)

        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                self.token = data["token"]

        return response

    def authenticate(self) -> str:
        """Authenticate and store token. Returns the token."""
        response = self.create_token()
        if response.status_code == 200 and self.token:
            return self.token
        raise Exception(f"Authentication failed: {response.text}")

    # ==================== Health Check ====================

    def health_check(self) -> requests.Response:
        """
        Check API health status.

        GET /ping
        """
        return self.session.get(PING_ENDPOINT)

    # ==================== Booking Operations ====================

    def get_booking_ids(
        self,
        firstname: Optional[str] = None,
        lastname: Optional[str] = None,
        checkin: Optional[str] = None,
        checkout: Optional[str] = None,
    ) -> requests.Response:
        """
        Get all booking IDs with optional filters.

        GET /booking
        """
        params = {}
        if firstname:
            params["firstname"] = firstname
        if lastname:
            params["lastname"] = lastname
        if checkin:
            params["checkin"] = checkin
        if checkout:
            params["checkout"] = checkout

        return self.session.get(BOOKING_ENDPOINT, params=params, headers=HEADERS)

    def get_booking(self, booking_id: int, accept: str = "application/json") -> requests.Response:
        """
        Get a specific booking by ID.

        GET /booking/:id
        """
        headers = {**HEADERS, "Accept": accept}
        return self.session.get(get_booking_url(booking_id), headers=headers)

    def create_booking(self, booking_data: dict) -> requests.Response:
        """
        Create a new booking.

        POST /booking
        """
        return self.session.post(BOOKING_ENDPOINT, json=booking_data, headers=HEADERS)

    def update_booking(
        self,
        booking_id: int,
        booking_data: dict,
        use_token: bool = True,
    ) -> requests.Response:
        """
        Update an existing booking (full update).

        PUT /booking/:id
        Requires authentication.
        """
        if use_token and self.token:
            headers = get_auth_header(self.token)
        else:
            headers = get_basic_auth_header()

        return self.session.put(get_booking_url(booking_id), json=booking_data, headers=headers)

    def partial_update_booking(
        self,
        booking_id: int,
        booking_data: dict,
        use_token: bool = True,
    ) -> requests.Response:
        """
        Partially update an existing booking.

        PATCH /booking/:id
        Requires authentication.
        """
        if use_token and self.token:
            headers = get_auth_header(self.token)
        else:
            headers = get_basic_auth_header()

        return self.session.patch(get_booking_url(booking_id), json=booking_data, headers=headers)

    def delete_booking(self, booking_id: int, use_token: bool = True) -> requests.Response:
        """
        Delete a booking.

        DELETE /booking/:id
        Requires authentication.
        """
        if use_token and self.token:
            headers = get_auth_header(self.token)
        else:
            headers = get_basic_auth_header()

        return self.session.delete(get_booking_url(booking_id), headers=headers)

    # ==================== Raw Request Methods ====================

    def raw_get(self, url: str, **kwargs) -> requests.Response:
        """Make a raw GET request."""
        return self.session.get(url, **kwargs)

    def raw_post(self, url: str, **kwargs) -> requests.Response:
        """Make a raw POST request."""
        return self.session.post(url, **kwargs)

    def raw_put(self, url: str, **kwargs) -> requests.Response:
        """Make a raw PUT request."""
        return self.session.put(url, **kwargs)

    def raw_patch(self, url: str, **kwargs) -> requests.Response:
        """Make a raw PATCH request."""
        return self.session.patch(url, **kwargs)

    def raw_delete(self, url: str, **kwargs) -> requests.Response:
        """Make a raw DELETE request."""
        return self.session.delete(url, **kwargs)
