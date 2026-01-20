"""
Base Configuration for API Endpoints

Contains shared configuration, base URL, and common headers.
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Base URL
BASE_URL = os.getenv("BASE_URL", "https://restful-booker.herokuapp.com")

# Common Request Headers
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

HEADERS_XML = {
    "Content-Type": "text/xml",
    "Accept": "application/xml",
}

HEADERS_URLENCODED = {
    "Content-Type": "application/x-www-form-urlencoded",
    "Accept": "application/json",
}
