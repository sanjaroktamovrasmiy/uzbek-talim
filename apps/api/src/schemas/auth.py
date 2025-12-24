"""
Authentication schemas.
"""

from pydantic import BaseModel, Field, field_validator

from shared.utils import validate_phone, format_phone


class RegisterRequest(BaseModel):
    """Registration request."""

    phone: str = Field(..., description="Phone number")
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and format phone number."""
        if not validate_phone(v):
            raise ValueError("Invalid phone number format")
        return format_phone(v)


class RegisterResponse(BaseModel):
    """Registration response."""

    message: str
    phone: str
    verification_required: bool = True


class VerifyPhoneRequest(BaseModel):
    """Phone verification request."""

    phone: str
    code: str = Field(..., min_length=4, max_length=6)

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and format phone number."""
        return format_phone(v)


class VerifyPhoneResponse(BaseModel):
    """Phone verification response."""

    message: str
    verified: bool


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""

    refresh_token: str

