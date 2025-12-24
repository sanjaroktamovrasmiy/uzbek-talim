"""
Notification repository.
"""

from typing import Optional, List

from sqlalchemy import select, func, update

from db.models import Notification
from src.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Notification repository."""

    model = Notification

    async def get_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
        is_read: Optional[bool] = None,
    ) -> List[Notification]:
        """Get notifications by user."""
        query = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        if is_read is not None:
            query = query.where(Notification.is_read == is_read)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_unread(
        self,
        user_id: str,
        limit: int = 50,
    ) -> List[Notification]:
        """Get unread notifications."""
        return await self.get_by_user(user_id, limit=limit, is_read=False)

    async def count_unread(self, user_id: str) -> int:
        """Count unread notifications."""
        result = await self.session.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
        )
        return result.scalar() or 0

    async def mark_as_read(self, id: str, user_id: str) -> Optional[Notification]:
        """Mark notification as read."""
        from datetime import datetime, timezone

        notification = await self.get_by_id(id)
        if notification and notification.user_id == user_id:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            await self.session.flush()
            await self.session.refresh(notification)
            return notification
        return None

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for user."""
        from datetime import datetime, timezone

        result = await self.session.execute(
            update(Notification)
            .where(
                Notification.user_id == user_id,
                Notification.is_read.is_(False),
            )
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        return result.rowcount

    async def get_unsent_telegram(self, limit: int = 100) -> List[Notification]:
        """Get notifications not yet sent via Telegram."""
        result = await self.session.execute(
            select(Notification)
            .where(Notification.sent_via_telegram.is_(False))
            .order_by(Notification.created_at)
            .limit(limit)
        )
        return list(result.scalars().all())

