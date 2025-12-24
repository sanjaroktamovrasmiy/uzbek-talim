"""
Bot middlewares.
"""

from aiogram import Dispatcher

from src.middlewares.database import DatabaseMiddleware
from src.middlewares.logging import LoggingMiddleware
from src.middlewares.throttling import ThrottlingMiddleware


def register_all_middlewares(dp: Dispatcher) -> None:
    """Register all middlewares."""
    dp.message.middleware(LoggingMiddleware())
    dp.message.middleware(ThrottlingMiddleware())
    dp.message.middleware(DatabaseMiddleware())

    dp.callback_query.middleware(LoggingMiddleware())
    dp.callback_query.middleware(ThrottlingMiddleware())
    dp.callback_query.middleware(DatabaseMiddleware())

