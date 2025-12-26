"""
User repository for bot.
"""

from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import User


class UserRepository:
    """User repository for bot."""

    def __init__(self, session: AsyncSession):
        """Initialize repository."""
        self.session = session

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID (only non-deleted users)."""
        result = await self.session.execute(
            select(User).where(
                User.telegram_id == telegram_id,
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_telegram_id_include_deleted(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID (including deleted users)."""
        result = await self.session.execute(
            select(User).where(
                User.telegram_id == telegram_id,
            )
        )
        return result.scalar_one_or_none()

    async def restore(self, user: User) -> User:
        """Restore soft-deleted user by setting deleted_at to None."""
        from datetime import datetime
        user.deleted_at = None
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number."""
        result = await self.session.execute(
            select(User).where(
                User.phone == phone,
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def create(self, user: User) -> User:
        """Create a new user."""
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update(self, user: User, **kwargs: Any) -> User:
        """Update user fields in-place."""
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

