"""
Course schemas.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, Field

from shared.constants import CourseStatus
from src.schemas.common import PaginatedResponse


class CourseBase(BaseModel):
    """Base course schema."""

    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    duration_months: int = Field(3, ge=1, le=24)
    lessons_per_week: int = Field(3, ge=1, le=7)
    lesson_duration_minutes: int = Field(90, ge=30, le=180)
    price: Decimal = Field(0, ge=0)
    discount_price: Optional[Decimal] = Field(None, ge=0)
    level: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None


class CourseCreateRequest(CourseBase):
    """Course creation request."""

    pass


class CourseUpdateRequest(BaseModel):
    """Course update request."""

    name: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = None
    duration_months: Optional[int] = Field(None, ge=1, le=24)
    lessons_per_week: Optional[int] = Field(None, ge=1, le=7)
    lesson_duration_minutes: Optional[int] = Field(None, ge=30, le=180)
    price: Optional[Decimal] = Field(None, ge=0)
    discount_price: Optional[Decimal] = Field(None, ge=0)
    level: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    is_featured: Optional[bool] = None


class CourseResponse(BaseModel):
    """Course response."""

    id: str
    slug: str
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    duration_months: int
    lessons_per_week: int
    lesson_duration_minutes: int
    price: Decimal
    discount_price: Optional[Decimal] = None
    current_price: Decimal
    status: str
    is_featured: bool
    level: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    groups_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CourseBriefResponse(BaseModel):
    """Brief course response for lists."""

    id: str
    slug: str
    name: str
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    current_price: Decimal
    status: str
    is_featured: bool
    category: Optional[str] = None

    model_config = {"from_attributes": True}


class CourseListResponse(PaginatedResponse[CourseBriefResponse]):
    """Paginated course list response."""

    pass

