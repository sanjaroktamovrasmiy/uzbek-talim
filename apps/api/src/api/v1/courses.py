"""
Course management endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.course import (
    CourseResponse,
    CourseListResponse,
    CourseCreateRequest,
    CourseUpdateRequest,
)
from src.schemas.common import PaginationParams
from src.services.course_service import CourseService
from src.core.deps import get_course_service, get_current_user, require_admin
from db.models import User


router = APIRouter()


@router.get("", response_model=CourseListResponse)
async def list_courses(
    course_service: Annotated[CourseService, Depends(get_course_service)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
) -> CourseListResponse:
    """
    List all published courses.
    """
    pagination = PaginationParams(page=page, size=size)
    return await course_service.list_courses(
        pagination=pagination,
        category=category,
        status=status,
        search=search,
    )


@router.post("", response_model=CourseResponse)
async def create_course(
    request: CourseCreateRequest,
    course_service: Annotated[CourseService, Depends(get_course_service)],
    _: Annotated[User, Depends(require_admin)],
) -> CourseResponse:
    """
    Create a new course (admin only).
    """
    return await course_service.create_course(request)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    course_service: Annotated[CourseService, Depends(get_course_service)],
) -> CourseResponse:
    """
    Get course by ID or slug.
    """
    return await course_service.get_course(course_id)


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    request: CourseUpdateRequest,
    course_service: Annotated[CourseService, Depends(get_course_service)],
    _: Annotated[User, Depends(require_admin)],
) -> CourseResponse:
    """
    Update course (admin only).
    """
    return await course_service.update_course(course_id, request)


@router.delete("/{course_id}")
async def delete_course(
    course_id: str,
    course_service: Annotated[CourseService, Depends(get_course_service)],
    _: Annotated[User, Depends(require_admin)],
) -> dict:
    """
    Delete course (admin only).
    """
    await course_service.delete_course(course_id)
    return {"message": "Course deleted successfully"}


@router.post("/{course_id}/publish")
async def publish_course(
    course_id: str,
    course_service: Annotated[CourseService, Depends(get_course_service)],
    _: Annotated[User, Depends(require_admin)],
) -> CourseResponse:
    """
    Publish course (admin only).
    """
    return await course_service.publish_course(course_id)

