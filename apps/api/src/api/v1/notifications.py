"""
Notification endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    NotificationCreateRequest,
)
from src.schemas.common import PaginationParams
from src.services.notification_service import NotificationService
from src.core.deps import get_notification_service, get_current_user, require_admin
from db.models import User


router = APIRouter()


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    notification_service: Annotated[NotificationService, Depends(get_notification_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = None,
) -> NotificationListResponse:
    """
    List notifications for current user.
    """
    pagination = PaginationParams(page=page, size=size)
    return await notification_service.list_notifications(
        user_id=current_user.id,
        pagination=pagination,
        is_read=is_read,
    )


@router.post("", response_model=NotificationResponse)
async def create_notification(
    request: NotificationCreateRequest,
    notification_service: Annotated[NotificationService, Depends(get_notification_service)],
    _: Annotated[User, Depends(require_admin)],
) -> NotificationResponse:
    """
    Create and send notification (admin only).
    """
    return await notification_service.create_notification(request)


@router.get("/unread-count")
async def get_unread_count(
    notification_service: Annotated[NotificationService, Depends(get_notification_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Get unread notifications count.
    """
    count = await notification_service.get_unread_count(current_user.id)
    return {"count": count}


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    notification_service: Annotated[NotificationService, Depends(get_notification_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> NotificationResponse:
    """
    Mark notification as read.
    """
    return await notification_service.mark_as_read(notification_id, current_user.id)


@router.post("/read-all")
async def mark_all_as_read(
    notification_service: Annotated[NotificationService, Depends(get_notification_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Mark all notifications as read.
    """
    count = await notification_service.mark_all_as_read(current_user.id)
    return {"message": f"{count} notifications marked as read"}

