"""
Group schemas.
"""

from datetime import date, time, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from src.schemas.common import PaginatedResponse


class GroupBase(BaseModel):
    """Base group schema."""

    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    max_students: int = Field(20, ge=1, le=100)
    room: Optional[str] = None


class GroupCreateRequest(GroupBase):
    """Group creation request."""

    course_id: str
    teacher_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_of_week: Optional[str] = None  # "1,3,5" for Mon, Wed, Fri


class GroupUpdateRequest(BaseModel):
    """Group update request."""

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    teacher_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_of_week: Optional[str] = None
    max_students: Optional[int] = Field(None, ge=1, le=100)
    room: Optional[str] = None
    is_active: Optional[bool] = None


class GroupResponse(BaseModel):
    """Group response."""

    id: str
    name: str
    description: Optional[str] = None
    course_id: str
    course_name: str = ""
    teacher_id: Optional[str] = None
    teacher_name: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_of_week: Optional[str] = None
    max_students: int
    current_students: int = 0
    has_capacity: bool = True
    room: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class GroupBriefResponse(BaseModel):
    """Brief group response for lists."""

    id: str
    name: str
    course_name: str = ""
    current_students: int = 0
    max_students: int
    is_active: bool

    model_config = {"from_attributes": True}


class GroupListResponse(PaginatedResponse[GroupBriefResponse]):
    """Paginated group list response."""

    pass


class EnrollStudentRequest(BaseModel):
    """Enroll student request."""

    student_id: str
    agreed_price: Decimal = Field(..., ge=0)
    discount_percent: int = Field(0, ge=0, le=100)
    discount_reason: Optional[str] = None
    notes: Optional[str] = None

