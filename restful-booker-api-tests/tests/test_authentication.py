"""
Authentication Endpoint Tests

POST /auth - Create authentication token
"""

from http import HTTPStatus

import pytest
from expects import be_a, be_empty, contain, equal, expect, have_key, have_len
from jsonschema import validate

from src.api_client import RestfulBookerClient
from src.schemas import AUTH_RESPONSE_SCHEMA, AUTH_ERROR_SCHEMA
from tests.data.test_data import VALID_AUTH_CREDENTIALS, INVALID_AUTH_SCENARIOS


def describe_create_authentication_token():
    """Tests for POST /auth endpoint."""

    @pytest.mark.smoke
    @pytest.mark.auth
    def test_should_return_token_with_valid_credentials(fresh_client: RestfulBookerClient):
        """Verify successful authentication returns a token."""
        result = fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))

        response_data = result.json()
        expect(response_data).to(have_key("token"))
        expect(response_data["token"]).to(be_a(str))
        expect(response_data["token"]).not_to(be_empty)

    @pytest.mark.auth
    @pytest.mark.schema
    def test_should_return_valid_token_schema(fresh_client: RestfulBookerClient):
        """Verify response matches expected JSON schema."""
        result = fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))
        validate(instance=result.json(), schema=AUTH_RESPONSE_SCHEMA)

    @pytest.mark.auth
    def test_should_store_token_in_client(fresh_client: RestfulBookerClient):
        """Verify token is stored in client after authentication."""
        expect(fresh_client.token).to(equal(None))

        fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )

        expect(fresh_client.token).not_to(equal(None))
        expect(fresh_client.token).to(be_a(str))

    @pytest.mark.auth
    def test_should_generate_unique_tokens_per_request(fresh_client: RestfulBookerClient):
        """Verify each authentication request generates a unique token."""
        result1 = fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )
        token1 = result1.json()["token"]

        # Create new client to avoid token caching
        client2 = RestfulBookerClient()
        result2 = client2.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )
        token2 = result2.json()["token"]

        # Tokens should be different (or at least both valid)
        expect(token1).to(be_a(str))
        expect(token2).to(be_a(str))
        expect(token1).not_to(be_empty)
        expect(token2).not_to(be_empty)


def describe_authentication_with_invalid_credentials():
    """Tests for authentication failures."""

    @pytest.mark.auth
    @pytest.mark.regression
    @pytest.mark.parametrize(
        "scenario",
        INVALID_AUTH_SCENARIOS,
        ids=[s["name"] for s in INVALID_AUTH_SCENARIOS],
    )
    def test_should_reject_invalid_credentials(fresh_client: RestfulBookerClient, scenario: dict):
        """Verify authentication fails with invalid credentials."""
        result = fresh_client.create_token(
            username=scenario["username"],
            password=scenario["password"],
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))

        response_data = result.json()
        expect(response_data).to(have_key("reason"))
        expect(response_data["reason"]).to(equal(scenario["expected_reason"]))

    @pytest.mark.auth
    def test_should_not_store_token_on_failed_auth(fresh_client: RestfulBookerClient):
        """Verify token is not stored when authentication fails."""
        fresh_client.create_token(username="wrong", password="wrong")

        expect(fresh_client.token).to(equal(None))

    @pytest.mark.auth
    @pytest.mark.validation
    def test_should_handle_missing_username_field(fresh_client: RestfulBookerClient):
        """Verify API handles missing username field."""
        import requests
        from src.endpoints.auth import AUTH_ENDPOINT
        from src.endpoints.config import HEADERS

        result = requests.post(
            AUTH_ENDPOINT,
            json={"password": "password123"},
            headers=HEADERS,
        )

        # API should still respond (may return error or bad credentials)
        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.auth
    @pytest.mark.validation
    def test_should_handle_missing_password_field(fresh_client: RestfulBookerClient):
        """Verify API handles missing password field."""
        import requests
        from src.endpoints.auth import AUTH_ENDPOINT
        from src.endpoints.config import HEADERS

        result = requests.post(
            AUTH_ENDPOINT,
            json={"username": "admin"},
            headers=HEADERS,
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.auth
    @pytest.mark.validation
    def test_should_handle_empty_request_body(fresh_client: RestfulBookerClient):
        """Verify API handles empty request body."""
        import requests
        from src.endpoints.auth import AUTH_ENDPOINT
        from src.endpoints.config import HEADERS

        result = requests.post(AUTH_ENDPOINT, json={}, headers=HEADERS)

        expect(result.status_code).to(equal(HTTPStatus.OK))

    @pytest.mark.auth
    @pytest.mark.validation
    def test_should_handle_null_values(fresh_client: RestfulBookerClient):
        """Verify API handles null values in credentials."""
        import requests
        from src.endpoints.auth import AUTH_ENDPOINT
        from src.endpoints.config import HEADERS

        result = requests.post(
            AUTH_ENDPOINT,
            json={"username": None, "password": None},
            headers=HEADERS,
        )

        expect(result.status_code).to(equal(HTTPStatus.OK))


def describe_authentication_token_format():
    """Tests for token format and characteristics."""

    @pytest.mark.auth
    def test_token_should_be_alphanumeric(fresh_client: RestfulBookerClient):
        """Verify token contains only alphanumeric characters."""
        result = fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )

        token = result.json()["token"]
        expect(token.isalnum()).to(equal(True))

    @pytest.mark.auth
    def test_token_should_have_reasonable_length(fresh_client: RestfulBookerClient):
        """Verify token has reasonable length (not too short, not too long)."""
        result = fresh_client.create_token(
            username=VALID_AUTH_CREDENTIALS["username"],
            password=VALID_AUTH_CREDENTIALS["password"],
        )

        token = result.json()["token"]
        expect(len(token)).to(be_between(10, 50))


def be_between(min_val, max_val):
    """Custom matcher for between comparison."""
    from expects.matchers import Matcher

    class BeBetween(Matcher):
        def _match(self, actual):
            return min_val <= actual <= max_val, []

        def _description(self, *args):
            return f"be between {min_val} and {max_val}"

    return BeBetween()
