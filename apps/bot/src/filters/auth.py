"""
Authentication filters.
"""

from typing import Any, Union

from aiogram.filters import BaseFilter
from aiogram.types import CallbackQuery, Message
from sqlalchemy.ext.asyncio import AsyncSession

from shared import get_settings
from db.session import AsyncSessionLocal
from src.services.user_service import UserService


settings = get_settings()


class RegisteredUserFilter(BaseFilter):
    """Filter for registered users only."""

    async def __call__(
        self,
        event: Union[Message, CallbackQuery],
        **kwargs: Any,
    ) -> bool:
        """Check if user is registered."""
        user = event.from_user
        if not user:
            return False

        session: AsyncSession | None = kwargs.get("session")

        # Fallback: if middleware didn't inject `session` (e.g., ordering),
        # open a short-lived session just for this check.
        if session is None:
            async with AsyncSessionLocal() as session_fallback:
                user_service = UserService(session_fallback)
                db_user = await user_service.get_user_by_telegram_id(user.id)
        else:
            user_service = UserService(session)
            db_user = await user_service.get_user_by_telegram_id(user.id)

        if not db_user:
            return False

        # User must be verified and have real phone number
        return (
            db_user.is_verified
            and db_user.phone
            and db_user.phone != "+998000000000"
        )


class AdminFilter(BaseFilter):
    """Filter for admin users only."""

    async def __call__(self, event: Union[Message, CallbackQuery], **kwargs: Any) -> bool:
        """Check if user is admin."""
        user = event.from_user
        if not user:
            return False

        # Check if user ID is in admin list
        return user.id in settings.telegram_admin_ids


class StaffFilter(BaseFilter):
    """Filter for staff users."""

    async def __call__(self, event: Union[Message, CallbackQuery], **kwargs: Any) -> bool:
        """Check if user is staff."""
        user = event.from_user
        if not user:
            return False

        # Admin is also staff
        if user.id in settings.telegram_admin_ids:
            return True

        # TODO: Check database for staff role
        return False

