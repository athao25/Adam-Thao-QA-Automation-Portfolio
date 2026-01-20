"""
Health Check Endpoint

GET /ping - Check API health status
"""

from src.endpoints.config import BASE_URL

# Ping/Health Check Endpoint
PING_ENDPOINT = f"{BASE_URL}/ping"
