"""
Bot handlers.
"""

from aiogram import Dispatcher

from src.handlers.common import router as common_router
from src.handlers.auth import router as auth_router
from src.handlers.student import router as student_router
from src.handlers.admin import router as admin_router


def register_all_handlers(dp: Dispatcher) -> None:
    """Register all handlers."""
    dp.include_router(common_router)
    dp.include_router(auth_router)
    dp.include_router(student_router)
    dp.include_router(admin_router)

