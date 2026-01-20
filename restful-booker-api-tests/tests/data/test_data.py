"""
Test Data and Scenarios

Centralized test data for data-driven testing.
"""

# ==================== Authentication Test Data ====================

VALID_AUTH_CREDENTIALS = {"username": "admin", "password": "password123"}

INVALID_AUTH_SCENARIOS = [
    {
        "name": "invalid_username",
        "username": "wronguser",
        "password": "password123",
        "expected_reason": "Bad credentials",
    },
    {
        "name": "invalid_password",
        "username": "admin",
        "password": "wrongpassword",
        "expected_reason": "Bad credentials",
    },
    {
        "name": "empty_username",
        "username": "",
        "password": "password123",
        "expected_reason": "Bad credentials",
    },
    {
        "name": "empty_password",
        "username": "admin",
        "password": "",
        "expected_reason": "Bad credentials",
    },
    {
        "name": "both_empty",
        "username": "",
        "password": "",
        "expected_reason": "Bad credentials",
    },
]

# ==================== Booking Test Data ====================

VALID_BOOKING = {
    "firstname": "Jim",
    "lastname": "Brown",
    "totalprice": 111,
    "depositpaid": True,
    "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
    "additionalneeds": "Breakfast",
}

BOOKING_WITHOUT_ADDITIONAL_NEEDS = {
    "firstname": "Sally",
    "lastname": "Johnson",
    "totalprice": 200,
    "depositpaid": False,
    "bookingdates": {"checkin": "2024-02-10", "checkout": "2024-02-15"},
}

BOOKING_WITH_ZERO_PRICE = {
    "firstname": "Free",
    "lastname": "Stay",
    "totalprice": 0,
    "depositpaid": True,
    "bookingdates": {"checkin": "2024-03-01", "checkout": "2024-03-02"},
}

BOOKING_WITH_HIGH_PRICE = {
    "firstname": "Luxury",
    "lastname": "Guest",
    "totalprice": 99999,
    "depositpaid": True,
    "bookingdates": {"checkin": "2024-06-01", "checkout": "2024-06-30"},
    "additionalneeds": "Presidential Suite with all amenities",
}

# ==================== Invalid Booking Scenarios ====================

INVALID_BOOKING_SCENARIOS = [
    {
        "name": "missing_firstname",
        "data": {
            "lastname": "Test",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        },
    },
    {
        "name": "missing_lastname",
        "data": {
            "firstname": "Test",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        },
    },
    {
        "name": "missing_totalprice",
        "data": {
            "firstname": "Test",
            "lastname": "User",
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        },
    },
    {
        "name": "missing_depositpaid",
        "data": {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "bookingdates": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
        },
    },
    {
        "name": "missing_bookingdates",
        "data": {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
        },
    },
    {
        "name": "missing_checkin",
        "data": {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkout": "2024-01-05"},
        },
    },
    {
        "name": "missing_checkout",
        "data": {
            "firstname": "Test",
            "lastname": "User",
            "totalprice": 100,
            "depositpaid": True,
            "bookingdates": {"checkin": "2024-01-01"},
        },
    },
    {
        "name": "empty_body",
        "data": {},
    },
]

# ==================== Partial Update Scenarios ====================

PARTIAL_UPDATE_SCENARIOS = [
    {
        "name": "update_firstname_only",
        "data": {"firstname": "UpdatedFirst"},
        "field_to_verify": "firstname",
    },
    {
        "name": "update_lastname_only",
        "data": {"lastname": "UpdatedLast"},
        "field_to_verify": "lastname",
    },
    {
        "name": "update_totalprice_only",
        "data": {"totalprice": 999},
        "field_to_verify": "totalprice",
    },
    {
        "name": "update_depositpaid_only",
        "data": {"depositpaid": False},
        "field_to_verify": "depositpaid",
    },
    {
        "name": "update_additionalneeds_only",
        "data": {"additionalneeds": "Updated needs"},
        "field_to_verify": "additionalneeds",
    },
    {
        "name": "update_multiple_fields",
        "data": {"firstname": "Multi", "lastname": "Update", "totalprice": 555},
        "field_to_verify": "firstname",
    },
]

# ==================== Filter Test Data ====================

FILTER_SCENARIOS = [
    {"name": "filter_by_firstname", "params": {"firstname": "Jim"}},
    {"name": "filter_by_lastname", "params": {"lastname": "Brown"}},
    {"name": "filter_by_checkin", "params": {"checkin": "2024-01-01"}},
    {"name": "filter_by_checkout", "params": {"checkout": "2024-01-05"}},
    {
        "name": "filter_by_firstname_and_lastname",
        "params": {"firstname": "Jim", "lastname": "Brown"},
    },
    {
        "name": "filter_by_date_range",
        "params": {"checkin": "2024-01-01", "checkout": "2024-01-05"},
    },
]

# ==================== Non-Existent Resource IDs ====================

NON_EXISTENT_BOOKING_IDS = [0, -1, 999999999, 2147483647]

# ==================== Invalid ID Formats ====================

INVALID_ID_FORMATS = ["abc", "12.5", "null", "undefined", "", " ", "!@#$%"]

# ==================== Boundary Value Test Data ====================

PRICE_BOUNDARY_SCENARIOS = [
    {"name": "zero_price", "price": 0, "should_succeed": True},
    {"name": "one_cent", "price": 1, "should_succeed": True},
    {"name": "negative_price", "price": -1, "should_succeed": True},  # API is permissive
    {"name": "large_negative", "price": -999999, "should_succeed": True},
    {"name": "standard_price", "price": 100, "should_succeed": True},
    {"name": "high_price", "price": 99999, "should_succeed": True},
    {"name": "very_high_price", "price": 999999999, "should_succeed": True},
    {"name": "float_price", "price": 99.99, "should_succeed": True},
    {"name": "float_many_decimals", "price": 99.999999, "should_succeed": True},
]

# ==================== Content Type Scenarios ====================

CONTENT_TYPE_SCENARIOS = [
    {"name": "json", "content_type": "application/json", "should_succeed": True},
    {"name": "json_charset", "content_type": "application/json; charset=utf-8", "should_succeed": True},
    {"name": "text_plain", "content_type": "text/plain", "should_succeed": False},
    {"name": "text_html", "content_type": "text/html", "should_succeed": False},
    {"name": "xml", "content_type": "application/xml", "should_succeed": False},
    {"name": "form_urlencoded", "content_type": "application/x-www-form-urlencoded", "should_succeed": False},
]

ACCEPT_HEADER_SCENARIOS = [
    {"name": "json", "accept": "application/json", "expected_type": "json"},
    {"name": "xml", "accept": "application/xml", "expected_type": "xml"},
    {"name": "any", "accept": "*/*", "expected_type": "json"},
    {"name": "text_html", "accept": "text/html", "expected_type": "json"},
]

# ==================== Special Character Scenarios ====================

SPECIAL_CHARACTER_NAMES = [
    {"name": "hyphenated", "firstname": "Mary-Jane", "lastname": "Smith-Jones"},
    {"name": "apostrophe", "firstname": "Patrick", "lastname": "O'Brien"},
    {"name": "unicode_spanish", "firstname": "José", "lastname": "García"},
    {"name": "unicode_german", "firstname": "Müller", "lastname": "Strauß"},
    {"name": "unicode_chinese", "firstname": "李", "lastname": "明"},
    {"name": "unicode_japanese", "firstname": "田中", "lastname": "太郎"},
    {"name": "unicode_arabic", "firstname": "محمد", "lastname": "علي"},
    {"name": "mixed_case", "firstname": "UPPERCASE", "lastname": "lowercase"},
    {"name": "numbers_in_name", "firstname": "John3", "lastname": "Smith2nd"},
    {"name": "spaces", "firstname": "Mary Ann", "lastname": "Van Der Berg"},
]

# ==================== Date Format Scenarios ====================

VALID_DATE_FORMATS = [
    {"name": "standard_iso", "checkin": "2024-01-01", "checkout": "2024-01-05"},
    {"name": "same_day", "checkin": "2024-06-15", "checkout": "2024-06-15"},
    {"name": "long_stay", "checkin": "2024-01-01", "checkout": "2024-12-31"},
    {"name": "past_dates", "checkin": "2020-01-01", "checkout": "2020-01-05"},
    {"name": "future_dates", "checkin": "2030-01-01", "checkout": "2030-01-05"},
    {"name": "leap_year", "checkin": "2024-02-29", "checkout": "2024-03-01"},
]

INVALID_DATE_FORMATS = [
    {"name": "wrong_separator", "date": "2024/01/01"},
    {"name": "us_format", "date": "01-01-2024"},
    {"name": "eu_format", "date": "01/01/2024"},
    {"name": "invalid_month", "date": "2024-13-01"},
    {"name": "invalid_day", "date": "2024-01-32"},
    {"name": "text_date", "date": "January 1, 2024"},
    {"name": "partial_date", "date": "2024-01"},
    {"name": "empty_string", "date": ""},
    {"name": "null_string", "date": "null"},
    {"name": "random_text", "date": "not-a-date"},
]

# ==================== HTTP Method Scenarios ====================

HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

BOOKING_ENDPOINT_ALLOWED_METHODS = {
    "/booking": ["GET", "POST", "HEAD", "OPTIONS"],
    "/booking/{id}": ["GET", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    "/ping": ["GET"],
    "/auth": ["POST"],
}

# ==================== String Length Scenarios ====================

STRING_LENGTH_SCENARIOS = [
    {"name": "empty", "value": ""},
    {"name": "single_char", "value": "A"},
    {"name": "short", "value": "AB"},
    {"name": "normal", "value": "John"},
    {"name": "medium", "value": "A" * 50},
    {"name": "long", "value": "A" * 100},
    {"name": "very_long", "value": "A" * 500},
    {"name": "extremely_long", "value": "A" * 1000},
]

# ==================== Boolean Scenarios ====================

BOOLEAN_SCENARIOS = [
    {"name": "true_bool", "value": True, "expected": True},
    {"name": "false_bool", "value": False, "expected": False},
    {"name": "string_true", "value": "true", "expected": True},
    {"name": "string_false", "value": "false", "expected": False},
    {"name": "int_one", "value": 1, "expected": True},
    {"name": "int_zero", "value": 0, "expected": False},
]
