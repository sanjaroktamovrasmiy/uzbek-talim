"""
Notification schemas.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from shared.constants import NotificationType
from src.schemas.common import PaginatedResponse


class NotificationCreateRequest(BaseModel):
    """Notification creation request."""

    user_id: Optional[str] = None  # None = broadcast to all
    user_ids: Optional[List[str]] = None  # List of specific users
    title: str = Field(..., min_length=2, max_length=255)
    message: str = Field(..., min_length=2)
    type: NotificationType = NotificationType.INFO
    action_url: Optional[str] = None
    send_telegram: bool = True


class NotificationResponse(BaseModel):
    """Notification response."""

    id: str
    user_id: str
    title: str
    message: str
    type: str
    is_read: bool
    read_at: Optional[datetime] = None
    sent_via_telegram: bool
    sent_at: Optional[datetime] = None
    action_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationBriefResponse(BaseModel):
    """Brief notification response for lists."""

    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(PaginatedResponse[NotificationBriefResponse]):
    """Paginated notification list response."""

    pass

