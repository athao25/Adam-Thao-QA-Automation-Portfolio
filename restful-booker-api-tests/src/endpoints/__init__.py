"""
API Endpoints Package

Organized endpoint modules for the Restful-Booker API.
"""

from src.endpoints.config import BASE_URL, HEADERS, HEADERS_XML, HEADERS_URLENCODED
from src.endpoints.auth import AUTH_ENDPOINT, DEFAULT_USERNAME, DEFAULT_PASSWORD
from src.endpoints.booking import BOOKING_ENDPOINT, get_booking_url
from src.endpoints.ping import PING_ENDPOINT

__all__ = [
    "BASE_URL",
    "HEADERS",
    "HEADERS_XML",
    "HEADERS_URLENCODED",
    "AUTH_ENDPOINT",
    "DEFAULT_USERNAME",
    "DEFAULT_PASSWORD",
    "BOOKING_ENDPOINT",
    "get_booking_url",
    "PING_ENDPOINT",
]
