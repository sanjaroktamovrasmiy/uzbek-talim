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
from db.models.test import Test, TestQuestion, TestQuestionOption
from db.models.test_result import TestResult

__all__ = [
    "User",
    "Course",
    "Group",
    "Lesson",
    "Enrollment",
    "Attendance",
    "Payment",
    "Notification",
    "Test",
    "TestQuestion",
    "TestQuestionOption",
    "TestResult",
]

