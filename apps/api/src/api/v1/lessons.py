"""
Lesson management endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.lesson import (
    LessonResponse,
    LessonListResponse,
    LessonCreateRequest,
    LessonUpdateRequest,
    AttendanceRequest,
)
from src.schemas.common import PaginationParams
from src.services.lesson_service import LessonService
from src.core.deps import get_lesson_service, get_current_user, require_staff
from db.models import User


router = APIRouter()


@router.get("", response_model=LessonListResponse)
async def list_lessons(
    lesson_service: Annotated[LessonService, Depends(get_lesson_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    group_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
) -> LessonListResponse:
    """
    List lessons.
    """
    pagination = PaginationParams(page=page, size=size)
    return await lesson_service.list_lessons(
        user=current_user,
        pagination=pagination,
        group_id=group_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.post("", response_model=LessonResponse)
async def create_lesson(
    request: LessonCreateRequest,
    lesson_service: Annotated[LessonService, Depends(get_lesson_service)],
    _: Annotated[User, Depends(require_staff)],
) -> LessonResponse:
    """
    Create a new lesson (staff only).
    """
    return await lesson_service.create_lesson(request)


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    lesson_service: Annotated[LessonService, Depends(get_lesson_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> LessonResponse:
    """
    Get lesson by ID.
    """
    return await lesson_service.get_lesson(lesson_id, current_user)


@router.patch("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    request: LessonUpdateRequest,
    lesson_service: Annotated[LessonService, Depends(get_lesson_service)],
    _: Annotated[User, Depends(require_staff)],
) -> LessonResponse:
    """
    Update lesson (staff only).
    """
    return await lesson_service.update_lesson(lesson_id, request)


@router.post("/{lesson_id}/attendance")
async def mark_attendance(
    lesson_id: str,
    request: AttendanceRequest,
    lesson_service: Annotated[LessonService, Depends(get_lesson_service)],
    _: Annotated[User, Depends(require_staff)],
) -> dict:
    """
    Mark attendance for lesson (staff only).
    """
    await lesson_service.mark_attendance(lesson_id, request)
    return {"message": "Attendance marked successfully"}

