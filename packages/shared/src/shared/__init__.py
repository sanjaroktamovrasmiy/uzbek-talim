"""
Shared utilities for Uzbek Ta'lim platform.

This package contains common utilities, constants, and exceptions
shared between API, Bot, and other services.
"""

from shared.config import Settings, get_settings
from shared.constants import UserRole, CourseStatus, PaymentStatus
from shared.exceptions import (
    AppException,
    NotFoundError,
    ValidationError,
    AuthenticationError,
    PermissionDeniedError,
)

__version__ = "1.0.0"

__all__ = [
    # Config
    "Settings",
    "get_settings",
    # Constants
    "UserRole",
    "CourseStatus",
    "PaymentStatus",
    # Exceptions
    "AppException",
    "NotFoundError",
    "ValidationError",
    "AuthenticationError",
    "PermissionDeniedError",
]

