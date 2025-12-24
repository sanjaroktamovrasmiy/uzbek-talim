"""
User schemas.
"""

from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field, EmailStr, field_validator

from shared.constants import UserRole
from shared.utils import format_phone, validate_phone
from src.schemas.common import PaginatedResponse


class UserBase(BaseModel):
    """Base user schema."""

    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    birth_date: Optional[date] = None
    bio: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None


class UserCreateRequest(UserBase):
    """User creation request (admin)."""

    phone: str
    password: Optional[str] = None
    role: UserRole = UserRole.STUDENT

    @field_validator("phone")
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        """Validate and format phone number."""
        if not validate_phone(v):
            raise ValueError("Invalid phone number format")
        return format_phone(v)


class UserUpdateRequest(BaseModel):
    """User update request."""

    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    birth_date: Optional[date] = None
    bio: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """User response."""

    id: str
    phone: str
    email: Optional[str] = None
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    full_name: str
    birth_date: Optional[date] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    telegram_id: Optional[int] = None
    telegram_username: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserBriefResponse(BaseModel):
    """Brief user response for lists."""

    id: str
    phone: str
    full_name: str
    role: str
    is_active: bool
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class UserListResponse(PaginatedResponse[UserBriefResponse]):
    """Paginated user list response."""

    pass

