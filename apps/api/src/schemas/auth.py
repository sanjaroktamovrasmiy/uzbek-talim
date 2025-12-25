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
            raise ValueError("Noto'g'ri telefon raqam formati. Iltimos, +998XXXXXXXXX formatida kiriting.")
        return format_phone(v)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password strength."""
        if len(v) < 6:
            raise ValueError("Parol kamida 6 ta belgidan iborat bo'lishi kerak.")
        
        # Check for common weak passwords
        weak_passwords = [
            "123456", "1234567", "12345678", "123456789", "1234567890",
            "password", "password1", "password12", "password123",
            "qwerty", "qwerty1", "qwerty12", "qwerty123",
            "abc123", "admin", "letmein", "welcome", "monkey",
            "111111", "000000", "123123", "654321",
        ]
        
        if v.lower() in weak_passwords:
            raise ValueError(
                "Bu parol juda oddiy va xavfsiz emas. "
                "Iltimos, kuchliroq parol tanlang (harflar, raqamlar va belgilar aralashmasi)."
            )
        
        # Check if password is all numbers
        if v.isdigit():
            raise ValueError(
                "Parol faqat raqamlardan iborat bo'lmasligi kerak. "
                "Iltimos, harflar va raqamlar aralashmasini ishlating."
            )
        
        # Check if password is all letters
        if v.isalpha():
            raise ValueError(
                "Parol faqat harflardan iborat bo'lmasligi kerak. "
                "Iltimos, raqamlar ham qo'shing."
            )
        
        return v


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


class SendTelegramCodeRequest(BaseModel):
    """Request to send verification code via Telegram."""

    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and format phone number."""
        return format_phone(v)


class SendTelegramCodeResponse(BaseModel):
    """Response for sending Telegram code."""

    success: bool
    message: str
    phone: str


class VerifyTelegramCodeRequest(BaseModel):
    """Request to verify Telegram code."""

    phone: str
    code: str = Field(..., min_length=4, max_length=6)
    return_tokens: bool = False  # If True, return JWT tokens after verification

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and format phone number."""
        return format_phone(v)


class VerifyTelegramCodeResponse(BaseModel):
    """Response for verifying Telegram code."""

    success: bool
    message: str
    verified: bool
    access_token: str | None = None
    refresh_token: str | None = None
    expires_in: int | None = None


class ChangePasswordRequest(BaseModel):
    """Change password request."""

    current_password: str = Field(..., min_length=6, max_length=100)
    new_password: str = Field(..., min_length=6, max_length=100)


class ChangePasswordResponse(BaseModel):
    """Change password response."""

    message: str
    success: bool

