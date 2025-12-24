"""
Throttling middleware to prevent spam.
"""

import time
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message, CallbackQuery


class ThrottlingMiddleware(BaseMiddleware):
    """Middleware for rate limiting."""

    def __init__(self, rate_limit: float = 0.5):
        """
        Initialize middleware.

        Args:
            rate_limit: Minimum seconds between messages
        """
        self.rate_limit = rate_limit
        self.user_timestamps: Dict[int, float] = {}

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        """Check rate limit and call handler."""
        user_id = None

        if isinstance(event, Message):
            user_id = event.from_user.id if event.from_user else None
        elif isinstance(event, CallbackQuery):
            user_id = event.from_user.id if event.from_user else None

        if user_id:
            current_time = time.time()
            last_time = self.user_timestamps.get(user_id, 0)

            if current_time - last_time < self.rate_limit:
                # Rate limited - skip handler
                if isinstance(event, CallbackQuery):
                    await event.answer("Iltimos, sekinroq bosing!", show_alert=True)
                return None

            self.user_timestamps[user_id] = current_time

            # Cleanup old entries periodically
            if len(self.user_timestamps) > 1000:
                cutoff = current_time - 60
                self.user_timestamps = {
                    uid: ts
                    for uid, ts in self.user_timestamps.items()
                    if ts > cutoff
                }

        return await handler(event, data)

