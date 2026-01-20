"""
Health Check / Ping Endpoint Tests

GET /ping - Verify API is operational
"""

from http import HTTPStatus

import pytest
import requests
from expects import equal, expect

from src.api_client import RestfulBookerClient
from src.endpoints.ping import PING_ENDPOINT


def describe_health_check_endpoint():
    """Tests for the /ping health check endpoint."""

    @pytest.mark.smoke
    def test_should_return_successful_response_when_api_is_healthy(api_client: RestfulBookerClient):
        """Verify the API returns 201 when healthy."""
        result = api_client.health_check()

        expect(result.status_code).to(equal(HTTPStatus.CREATED))

    @pytest.mark.smoke
    def test_should_return_response_within_acceptable_time(api_client: RestfulBookerClient):
        """Verify health check responds quickly (under 2 seconds)."""
        result = api_client.health_check()

        expect(result.elapsed.total_seconds()).to(be_less_than(2.0))

    @pytest.mark.regression
    def test_should_accept_get_request_method():
        """Verify /ping accepts GET requests."""
        result = requests.get(PING_ENDPOINT)

        expect(result.status_code).to(equal(HTTPStatus.CREATED))

    @pytest.mark.regression
    def test_should_be_accessible_without_authentication():
        """Verify /ping doesn't require authentication."""
        result = requests.get(PING_ENDPOINT)

        # Should succeed without any auth headers
        expect(result.status_code).to(equal(HTTPStatus.CREATED))


def be_less_than(expected):
    """Custom matcher for less than comparison."""
    from expects.matchers import Matcher

    class BeLessThan(Matcher):
        def _match(self, actual):
            return actual < expected, []

        def _description(self, *args):
            return f"be less than {expected}"

    return BeLessThan()
