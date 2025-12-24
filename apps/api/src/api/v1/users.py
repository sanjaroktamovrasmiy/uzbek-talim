"""
User management endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.user import (
    UserResponse,
    UserListResponse,
    UserUpdateRequest,
    UserCreateRequest,
)
from src.schemas.common import PaginationParams
from src.services.user_service import UserService
from src.core.deps import get_user_service, get_current_user, require_admin
from db.models import User


router = APIRouter()


@router.get("", response_model=UserListResponse)
async def list_users(
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[User, Depends(require_admin)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> UserListResponse:
    """
    List all users (admin only).
    """
    pagination = PaginationParams(page=page, size=size)
    return await user_service.list_users(
        pagination=pagination,
        role=role,
        search=search,
        is_active=is_active,
    )


@router.post("", response_model=UserResponse)
async def create_user(
    request: UserCreateRequest,
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[User, Depends(require_admin)],
) -> UserResponse:
    """
    Create a new user (admin only).
    """
    return await user_service.create_user(request)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """
    Get user by ID.
    """
    # Users can only view their own profile unless admin
    if user_id != current_user.id and not current_user.is_admin:
        user_id = current_user.id
    return await user_service.get_user(user_id)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: UserUpdateRequest,
    user_service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """
    Update user profile.
    """
    # Users can only update their own profile unless admin
    if user_id != current_user.id and not current_user.is_admin:
        user_id = current_user.id
    return await user_service.update_user(user_id, request)


@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    user_service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[User, Depends(require_admin)],
) -> dict:
    """
    Delete user (soft delete, admin only).
    """
    await user_service.delete_user(user_id)
    return {"message": "User deleted successfully"}

