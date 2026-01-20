"""
JSON Schemas for Response Validation

These schemas are used to validate API response structures.
"""

BOOKING_DATES_SCHEMA = {
    "type": "object",
    "required": ["checkin", "checkout"],
    "properties": {
        "checkin": {"type": "string"},
        "checkout": {"type": "string"},
    },
    "additionalProperties": False,
}

BOOKING_SCHEMA = {
    "type": "object",
    "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
    "properties": {
        "firstname": {"type": "string"},
        "lastname": {"type": "string"},
        "totalprice": {"type": "integer"},
        "depositpaid": {"type": "boolean"},
        "bookingdates": BOOKING_DATES_SCHEMA,
        "additionalneeds": {"type": ["string", "null"]},
    },
    "additionalProperties": False,
}

BOOKING_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["bookingid", "booking"],
    "properties": {
        "bookingid": {"type": "integer"},
        "booking": BOOKING_SCHEMA,
    },
    "additionalProperties": False,
}

BOOKING_ID_SCHEMA = {
    "type": "object",
    "required": ["bookingid"],
    "properties": {
        "bookingid": {"type": "integer"},
    },
    "additionalProperties": False,
}

BOOKING_IDS_LIST_SCHEMA = {
    "type": "array",
    "items": BOOKING_ID_SCHEMA,
}

AUTH_RESPONSE_SCHEMA = {
    "type": "object",
    "required": ["token"],
    "properties": {
        "token": {"type": "string"},
    },
    "additionalProperties": False,
}

AUTH_ERROR_SCHEMA = {
    "type": "object",
    "required": ["reason"],
    "properties": {
        "reason": {"type": "string"},
    },
    "additionalProperties": False,
}
