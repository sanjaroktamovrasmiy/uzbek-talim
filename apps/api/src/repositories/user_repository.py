"""
User repository.
"""

from typing import Optional, List

from sqlalchemy import select, func, or_

from db.models import User
from src.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """User repository."""

    model = User

    async def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone number."""
        result = await self.session.execute(
            select(User).where(User.phone == phone, User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.session.execute(
            select(User).where(User.email == email, User.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        """Get user by Telegram ID."""
        result = await self.session.execute(
            select(User).where(
                User.telegram_id == telegram_id, User.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def search(
        self,
        query: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[User]:
        """Search users by name or phone."""
        search_pattern = f"%{query}%"
        result = await self.session.execute(
            select(User)
            .where(
                User.deleted_at.is_(None),
                or_(
                    User.phone.ilike(search_pattern),
                    User.first_name.ilike(search_pattern),
                    User.last_name.ilike(search_pattern),
                    User.email.ilike(search_pattern),
                ),
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_role(
        self,
        role: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[User]:
        """Get users by role."""
        result = await self.session.execute(
            select(User)
            .where(User.role == role, User.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_by_role(self, role: str) -> int:
        """Count users by role."""
        result = await self.session.execute(
            select(func.count(User.id)).where(
                User.role == role, User.deleted_at.is_(None)
            )
        )
        return result.scalar() or 0

    async def get_active_users(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[User]:
        """Get active users."""
        result = await self.session.execute(
            select(User)
            .where(User.is_active.is_(True), User.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

