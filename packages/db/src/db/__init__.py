"""
Database package for Uzbek Ta'lim platform.

Contains SQLAlchemy models, session management, and repositories.
"""

from db.session import (
    get_async_session,
    AsyncSessionLocal,
    engine,
)
from db.base import Base
from db.models import (
    User,
    Course,
    Group,
    Lesson,
    Enrollment,
    Attendance,
    Payment,
    Notification,
)

__version__ = "1.0.0"

__all__ = [
    # Session
    "get_async_session",
    "AsyncSessionLocal",
    "engine",
    # Base
    "Base",
    # Models
    "User",
    "Course",
    "Group",
    "Lesson",
    "Enrollment",
    "Attendance",
    "Payment",
    "Notification",
]

