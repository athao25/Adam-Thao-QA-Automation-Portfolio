"""
Booking Endpoints

GET    /booking      - Get all booking IDs
GET    /booking/:id  - Get specific booking
POST   /booking      - Create new booking
PUT    /booking/:id  - Update booking (full)
PATCH  /booking/:id  - Update booking (partial)
DELETE /booking/:id  - Delete booking
"""

from src.endpoints.config import BASE_URL

# Booking Endpoint
BOOKING_ENDPOINT = f"{BASE_URL}/booking"


def get_booking_url(booking_id: int) -> str:
    """
    Generate URL for a specific booking.

    Args:
        booking_id: The booking ID

    Returns:
        Full URL for the booking resource
    """
    return f"{BOOKING_ENDPOINT}/{booking_id}"
