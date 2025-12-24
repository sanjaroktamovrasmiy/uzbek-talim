"""
Database models for Uzbek Ta'lim platform.
"""

from db.models.user import User
from db.models.course import Course, Group
from db.models.lesson import Lesson
from db.models.enrollment import Enrollment
from db.models.attendance import Attendance
from db.models.payment import Payment
from db.models.notification import Notification

__all__ = [
    "User",
    "Course",
    "Group",
    "Lesson",
    "Enrollment",
    "Attendance",
    "Payment",
    "Notification",
]

