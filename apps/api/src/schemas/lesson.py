"""
Lesson schemas.
"""

from datetime import date, time, datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from shared.constants import LessonStatus, AttendanceStatus
from src.schemas.common import PaginatedResponse


class LessonBase(BaseModel):
    """Base lesson schema."""

    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    lesson_number: int = Field(..., ge=1)
    homework: Optional[str] = None


class LessonCreateRequest(LessonBase):
    """Lesson creation request."""

    group_id: str
    date: date
    start_time: time
    end_time: time


class LessonUpdateRequest(BaseModel):
    """Lesson update request."""

    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    status: Optional[LessonStatus] = None
    materials_url: Optional[str] = None
    homework: Optional[str] = None
    notes: Optional[str] = None


class LessonResponse(BaseModel):
    """Lesson response."""

    id: str
    title: str
    description: Optional[str] = None
    lesson_number: int
    group_id: str
    group_name: str = ""
    date: date
    start_time: time
    end_time: time
    status: str
    materials_url: Optional[str] = None
    homework: Optional[str] = None
    notes: Optional[str] = None
    teacher_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LessonBriefResponse(BaseModel):
    """Brief lesson response for lists."""

    id: str
    title: str
    lesson_number: int
    group_name: str = ""
    date: date
    start_time: time
    end_time: time
    status: str

    model_config = {"from_attributes": True}


class LessonListResponse(PaginatedResponse[LessonBriefResponse]):
    """Paginated lesson list response."""

    pass


class StudentAttendance(BaseModel):
    """Individual student attendance."""

    student_id: str
    status: AttendanceStatus = AttendanceStatus.PRESENT
    grade: Optional[int] = Field(None, ge=0, le=100)
    homework_grade: Optional[int] = Field(None, ge=0, le=100)
    notes: Optional[str] = None


class AttendanceRequest(BaseModel):
    """Attendance marking request."""

    attendances: List[StudentAttendance]

