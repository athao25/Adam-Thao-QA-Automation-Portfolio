"""
Internationalization Tests

Tests for unicode characters, special characters, and multi-language support.
"""

from http import HTTPStatus

import pytest
from expects import equal, expect, have_key

from src.api_client import RestfulBookerClient
from tests.data.test_data import SPECIAL_CHARACTER_NAMES, VALID_BOOKING


def describe_unicode_character_support():
    """Tests for unicode character handling."""

    @pytest.mark.parametrize(
        "scenario",
        SPECIAL_CHARACTER_NAMES,
        ids=[s["name"] for s in SPECIAL_CHARACTER_NAMES],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_accept_unicode_names(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify API accepts names with unicode characters."""
        booking = {
            **VALID_BOOKING,
            "firstname": scenario["firstname"],
            "lastname": scenario["lastname"],
        }

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()).to(have_key("bookingid"))

    @pytest.mark.parametrize(
        "scenario",
        SPECIAL_CHARACTER_NAMES,
        ids=[s["name"] for s in SPECIAL_CHARACTER_NAMES],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_store_unicode_names_correctly(
        api_client: RestfulBookerClient, scenario: dict
    ):
        """Verify unicode names are stored and retrieved correctly."""
        booking = {
            **VALID_BOOKING,
            "firstname": scenario["firstname"],
            "lastname": scenario["lastname"],
        }

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        stored = result.json()["booking"]
        expect(stored["firstname"]).to(equal(scenario["firstname"]))
        expect(stored["lastname"]).to(equal(scenario["lastname"]))


def describe_special_characters_in_additional_needs():
    """Tests for special characters in additionalneeds field."""

    @pytest.mark.parametrize(
        "additional_needs",
        [
            "Breakfast",
            "Café service",
            "日本語メニュー",
            "Frühstück mit Brötchen",
            "قهوة عربية",
            "Special diet: gluten-free, dairy-free",
            "Room with view & balcony",
            "VIP treatment (24/7 service)",
        ],
        ids=[
            "english",
            "french_accent",
            "japanese",
            "german_umlaut",
            "arabic",
            "with_colon",
            "with_ampersand",
            "with_parentheses",
        ],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_handle_special_characters_in_additional_needs(
        api_client: RestfulBookerClient, additional_needs: str
    ):
        """Verify API handles special characters in additionalneeds."""
        booking = {**VALID_BOOKING, "additionalneeds": additional_needs}

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        stored = result.json()["booking"]
        expect(stored.get("additionalneeds")).to(equal(additional_needs))


def describe_multi_language_booking_scenarios():
    """Tests for complete bookings in different languages."""

    @pytest.mark.parametrize(
        "firstname,lastname,needs",
        [
            ("John", "Smith", "Early check-in"),
            ("María", "González", "Habitación tranquila"),
            ("François", "Müller", "Petit déjeuner continental"),
            ("田中", "太郎", "和室希望"),
            ("Иван", "Петров", "Завтрак в номер"),
        ],
        ids=["english", "spanish", "french_german", "japanese", "russian"],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_create_booking_in_multiple_languages(
        api_client: RestfulBookerClient, firstname: str, lastname: str, needs: str
    ):
        """Verify bookings can be created with content in various languages."""
        booking = {
            **VALID_BOOKING,
            "firstname": firstname,
            "lastname": lastname,
            "additionalneeds": needs,
        }

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))

        stored = result.json()["booking"]
        expect(stored["firstname"]).to(equal(firstname))
        expect(stored["lastname"]).to(equal(lastname))


def describe_punctuation_and_symbols():
    """Tests for punctuation and symbol handling."""

    @pytest.mark.parametrize(
        "name,expected",
        [
            ("O'Brien", "O'Brien"),
            ("Mary-Jane", "Mary-Jane"),
            ("Dr. Smith", "Dr. Smith"),
            ("Smith Jr.", "Smith Jr."),
            ("Anna-Maria", "Anna-Maria"),
        ],
        ids=["apostrophe", "hyphen", "period_prefix", "period_suffix", "double_hyphen"],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_handle_punctuation_in_names(
        api_client: RestfulBookerClient, name: str, expected: str
    ):
        """Verify API handles punctuation in names correctly."""
        booking = {**VALID_BOOKING, "firstname": name}

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()["booking"]["firstname"]).to(equal(expected))

    @pytest.mark.parametrize(
        "lastname,expected",
        [
            ("Van Der Berg", "Van Der Berg"),
            ("de la Cruz", "de la Cruz"),
            ("von Trapp", "von Trapp"),
            ("O'Connor", "O'Connor"),
            ("Smith-Jones", "Smith-Jones"),
        ],
        ids=["dutch", "spanish", "german", "irish", "hyphenated"],
    )
    @pytest.mark.regression
    @pytest.mark.booking
    def test_should_handle_multi_word_surnames(
        api_client: RestfulBookerClient, lastname: str, expected: str
    ):
        """Verify API handles multi-word surnames correctly."""
        booking = {**VALID_BOOKING, "lastname": lastname}

        result = api_client.create_booking(booking)

        expect(result.status_code).to(equal(HTTPStatus.OK))
        expect(result.json()["booking"]["lastname"]).to(equal(expected))
