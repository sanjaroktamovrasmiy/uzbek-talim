"""
Group management endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status

from src.schemas.group import (
    GroupResponse,
    GroupListResponse,
    GroupCreateRequest,
    GroupUpdateRequest,
    EnrollStudentRequest,
)
from src.schemas.common import PaginationParams
from src.services.group_service import GroupService
from src.core.deps import get_group_service, get_current_user, require_admin, require_staff
from db.models import User


router = APIRouter()


@router.get("", response_model=GroupListResponse)
async def list_groups(
    group_service: Annotated[GroupService, Depends(get_group_service)],
    _: Annotated[User, Depends(require_staff)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    course_id: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> GroupListResponse:
    """
    List all groups (staff only).
    """
    pagination = PaginationParams(page=page, size=size)
    return await group_service.list_groups(
        pagination=pagination,
        course_id=course_id,
        is_active=is_active,
    )


@router.post("", response_model=GroupResponse)
async def create_group(
    request: GroupCreateRequest,
    group_service: Annotated[GroupService, Depends(get_group_service)],
    _: Annotated[User, Depends(require_admin)],
) -> GroupResponse:
    """
    Create a new group (admin only).
    """
    return await group_service.create_group(request)


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: str,
    group_service: Annotated[GroupService, Depends(get_group_service)],
    _: Annotated[User, Depends(require_staff)],
) -> GroupResponse:
    """
    Get group by ID (staff only).
    """
    return await group_service.get_group(group_id)


@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: str,
    request: GroupUpdateRequest,
    group_service: Annotated[GroupService, Depends(get_group_service)],
    _: Annotated[User, Depends(require_admin)],
) -> GroupResponse:
    """
    Update group (admin only).
    """
    return await group_service.update_group(group_id, request)


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    group_service: Annotated[GroupService, Depends(get_group_service)],
    _: Annotated[User, Depends(require_admin)],
) -> dict:
    """
    Delete group (admin only).
    """
    await group_service.delete_group(group_id)
    return {"message": "Group deleted successfully"}


@router.post("/{group_id}/enroll")
async def enroll_student(
    group_id: str,
    request: EnrollStudentRequest,
    group_service: Annotated[GroupService, Depends(get_group_service)],
    current_user: Annotated[User, Depends(require_staff)],
) -> dict:
    """
    Enroll student to group (staff only).
    Teachers cannot enroll themselves - only students can be enrolled.
    """
    from shared.constants import UserRole
    # Prevent teachers from enrolling themselves
    if current_user.role == UserRole.TEACHER.value and request.student_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Teachers cannot enroll themselves in courses. Only students can enroll.",
        )
    await group_service.enroll_student(group_id, request)
    return {"message": "Student enrolled successfully"}

