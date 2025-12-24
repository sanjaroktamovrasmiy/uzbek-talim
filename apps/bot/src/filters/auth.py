"""
Authentication filters.
"""

from typing import Union

from aiogram.filters import BaseFilter
from aiogram.types import Message, CallbackQuery

from shared import get_settings


settings = get_settings()


class RegisteredUserFilter(BaseFilter):
    """Filter for registered users only."""

    async def __call__(self, event: Union[Message, CallbackQuery]) -> bool:
        """Check if user is registered."""
        user = event.from_user
        if not user:
            return False

        # TODO: Check database for user registration
        # For now, allow all users
        return True


class AdminFilter(BaseFilter):
    """Filter for admin users only."""

    async def __call__(self, event: Union[Message, CallbackQuery]) -> bool:
        """Check if user is admin."""
        user = event.from_user
        if not user:
            return False

        # Check if user ID is in admin list
        return user.id in settings.telegram_admin_ids


class StaffFilter(BaseFilter):
    """Filter for staff users."""

    async def __call__(self, event: Union[Message, CallbackQuery]) -> bool:
        """Check if user is staff."""
        user = event.from_user
        if not user:
            return False

        # Admin is also staff
        if user.id in settings.telegram_admin_ids:
            return True

        # TODO: Check database for staff role
        return False

