"""
Data Models for Restful-Booker API

Pydantic models for request/response validation and type safety.
"""

from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class BookingDates(BaseModel):
    """Booking date range model."""

    checkin: str = Field(..., description="Check-in date (YYYY-MM-DD)")
    checkout: str = Field(..., description="Check-out date (YYYY-MM-DD)")


class Booking(BaseModel):
    """Booking data model."""

    firstname: str = Field(..., min_length=1, description="Guest first name")
    lastname: str = Field(..., min_length=1, description="Guest last name")
    totalprice: int = Field(..., ge=0, description="Total price in whole currency units")
    depositpaid: bool = Field(..., description="Whether deposit has been paid")
    bookingdates: BookingDates = Field(..., description="Check-in and check-out dates")
    additionalneeds: Optional[str] = Field(None, description="Additional requests")


class BookingResponse(BaseModel):
    """Response model for created booking."""

    bookingid: int = Field(..., description="Unique booking identifier")
    booking: Booking = Field(..., description="Booking details")


class BookingId(BaseModel):
    """Booking ID model from listing."""

    bookingid: int = Field(..., description="Booking identifier")


class AuthPayload(BaseModel):
    """Authentication request payload."""

    username: str = Field(..., description="Username for authentication")
    password: str = Field(..., description="Password for authentication")


class AuthResponse(BaseModel):
    """Authentication response with token."""

    token: str = Field(..., description="Authentication token")


class ErrorResponse(BaseModel):
    """Error response model."""

    reason: Optional[str] = Field(None, description="Error reason")
