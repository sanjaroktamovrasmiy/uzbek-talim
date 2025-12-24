"""
Notification service.
"""

from datetime import datetime, timezone
from typing import Optional

from shared import NotFoundError
from db.models import Notification

from src.schemas.notification import (
    NotificationCreateRequest,
    NotificationResponse,
    NotificationListResponse,
    NotificationBriefResponse,
)
from src.schemas.common import PaginationParams
from src.repositories.notification_repository import NotificationRepository


class NotificationService:
    """Notification service."""

    def __init__(self, notification_repo: NotificationRepository):
        """Initialize service."""
        self.notification_repo = notification_repo

    async def list_notifications(
        self,
        user_id: str,
        pagination: PaginationParams,
        is_read: Optional[bool] = None,
    ) -> NotificationListResponse:
        """
        List notifications for user.

        Args:
            user_id: User ID
            pagination: Pagination parameters
            is_read: Filter by read status

        Returns:
            Paginated notification list
        """
        notifications = await self.notification_repo.get_by_user(
            user_id,
            skip=pagination.offset,
            limit=pagination.size,
            is_read=is_read,
        )

        if is_read is False:
            total = await self.notification_repo.count_unread(user_id)
        else:
            total = len(notifications)

        items = [NotificationBriefResponse.model_validate(n) for n in notifications]

        return NotificationListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_notification(
        self,
        request: NotificationCreateRequest,
    ) -> NotificationResponse:
        """
        Create and send notification.

        Args:
            request: Notification creation data

        Returns:
            Created notification
        """
        # Determine recipients
        user_ids = []
        if request.user_id:
            user_ids = [request.user_id]
        elif request.user_ids:
            user_ids = request.user_ids
        else:
            # TODO: Broadcast to all users
            pass

        # Create notifications for each user
        created_notification = None
        for user_id in user_ids:
            notification = Notification(
                user_id=user_id,
                title=request.title,
                message=request.message,
                type=request.type.value,
                action_url=request.action_url,
            )
            await self.notification_repo.create(notification)
            created_notification = notification

            # Send via Telegram if requested
            if request.send_telegram:
                # TODO: Send via Telegram bot
                await self.notification_repo.update(
                    notification,
                    sent_via_telegram=True,
                    sent_at=datetime.now(timezone.utc),
                )

        if created_notification:
            return NotificationResponse.model_validate(created_notification)

        raise ValueError("No notifications created")

    async def get_unread_count(self, user_id: str) -> int:
        """
        Get unread notifications count.

        Args:
            user_id: User ID

        Returns:
            Unread count
        """
        return await self.notification_repo.count_unread(user_id)

    async def mark_as_read(
        self,
        notification_id: str,
        user_id: str,
    ) -> NotificationResponse:
        """
        Mark notification as read.

        Args:
            notification_id: Notification ID
            user_id: User ID

        Returns:
            Updated notification

        Raises:
            NotFoundError: If notification not found
        """
        notification = await self.notification_repo.mark_as_read(
            notification_id,
            user_id,
        )
        if not notification:
            raise NotFoundError("Notification", notification_id)

        return NotificationResponse.model_validate(notification)

    async def mark_all_as_read(self, user_id: str) -> int:
        """
        Mark all notifications as read.

        Args:
            user_id: User ID

        Returns:
            Number of notifications marked as read
        """
        return await self.notification_repo.mark_all_as_read(user_id)

