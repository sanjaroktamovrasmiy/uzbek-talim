"""
Logging middleware.
"""

import logging
from typing import Any, Awaitable, Callable, Dict

from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, Message, CallbackQuery


logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseMiddleware):
    """Middleware for logging all updates."""

    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any],
    ) -> Any:
        """Log update and call handler."""
        if isinstance(event, Message):
            user = event.from_user
            logger.info(
                f"Message from {user.id} (@{user.username}): {event.text or '[media]'}"
            )
        elif isinstance(event, CallbackQuery):
            user = event.from_user
            logger.info(
                f"Callback from {user.id} (@{user.username}): {event.data}"
            )

        return await handler(event, data)

