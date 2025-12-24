"""
Application constants and enums.

Centralized constants used across all services.
"""

from enum import Enum, IntEnum


class UserRole(str, Enum):
    """User roles in the system."""

    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    TEACHER = "teacher"
    STUDENT = "student"
    GUEST = "guest"

    @classmethod
    def get_staff_roles(cls) -> list["UserRole"]:
        """Get roles that are considered staff."""
        return [cls.SUPER_ADMIN, cls.ADMIN, cls.MANAGER, cls.TEACHER]

    @classmethod
    def get_admin_roles(cls) -> list["UserRole"]:
        """Get admin roles."""
        return [cls.SUPER_ADMIN, cls.ADMIN]


class CourseStatus(str, Enum):
    """Course status."""

    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    CANCELLED = "cancelled"


class LessonStatus(str, Enum):
    """Lesson status."""

    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EnrollmentStatus(str, Enum):
    """Student enrollment status."""

    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"
    SUSPENDED = "suspended"


class AttendanceStatus(str, Enum):
    """Attendance status."""

    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class PaymentStatus(str, Enum):
    """Payment status."""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    """Payment methods."""

    CASH = "cash"
    CARD = "card"
    PAYME = "payme"
    CLICK = "click"
    BANK_TRANSFER = "bank_transfer"


class NotificationType(str, Enum):
    """Notification types."""

    INFO = "info"
    WARNING = "warning"
    SUCCESS = "success"
    ERROR = "error"
    REMINDER = "reminder"


class MessagePriority(IntEnum):
    """Message priority levels."""

    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4


# ===========================================
# Application Constants
# ===========================================

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Cache TTL (seconds)
CACHE_TTL_SHORT = 60  # 1 minute
CACHE_TTL_MEDIUM = 300  # 5 minutes
CACHE_TTL_LONG = 3600  # 1 hour
CACHE_TTL_DAY = 86400  # 24 hours

# Rate Limiting
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60  # seconds

# File Upload
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB

# Uzbek Phone Regex
UZ_PHONE_REGEX = r"^\+998[0-9]{9}$"

# Date Formats
DATE_FORMAT = "%Y-%m-%d"
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
TIME_FORMAT = "%H:%M"

