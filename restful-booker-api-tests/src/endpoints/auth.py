"""
Authentication Endpoint

POST /auth - Create authentication token
"""

import os
import base64
from dotenv import load_dotenv
from src.endpoints.config import BASE_URL, HEADERS

load_dotenv()

# Authentication Endpoint
AUTH_ENDPOINT = f"{BASE_URL}/auth"

# Default Credentials
DEFAULT_USERNAME = os.getenv("API_USERNAME", "admin")
DEFAULT_PASSWORD = os.getenv("API_PASSWORD", "password123")


def get_auth_header(token: str) -> dict:
    """
    Generate Cookie header with authentication token.

    Args:
        token: Authentication token from /auth endpoint

    Returns:
        Headers dict with Cookie containing token
    """
    return {**HEADERS, "Cookie": f"token={token}"}


def get_basic_auth_header(
    username: str = DEFAULT_USERNAME,
    password: str = DEFAULT_PASSWORD,
) -> dict:
    """
    Generate Basic Authentication header.

    Args:
        username: Username for basic auth
        password: Password for basic auth

    Returns:
        Headers dict with Authorization header
    """
    credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
    return {**HEADERS, "Authorization": f"Basic {credentials}"}
