"""
User model for authentication and authorization.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import Boolean, Date, String, BigInteger, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin
from shared.constants import UserRole

if TYPE_CHECKING:
    from db.models.enrollment import Enrollment
    from db.models.payment import Payment
    from db.models.notification import Notification
    from db.models.test_result import TestResult


class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """User model."""

    # Basic info
    phone: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        index=True,
        nullable=False,
    )
    email: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    # Profile
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    birth_date: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Role and permissions
    role: Mapped[str] = mapped_column(
        String(50),
        default=UserRole.STUDENT.value,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Telegram integration
    telegram_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        unique=True,
        index=True,
        nullable=True,
    )
    telegram_username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Address
    region: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment",
        back_populates="student",
        lazy="selectin",
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="user",
        foreign_keys="[Payment.user_id]",
        lazy="selectin",
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        lazy="selectin",
    )
    test_results: Mapped[List["TestResult"]] = relationship(
        "TestResult",
        back_populates="user",
        lazy="selectin",
    )

    @property
    def full_name(self) -> str:
        """Get full name."""
        parts = [self.first_name, self.last_name]
        if self.middle_name:
            parts.insert(1, self.middle_name)
        return " ".join(parts)

    @property
    def is_admin(self) -> bool:
        """Check if user is admin."""
        return self.role in [UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value]

    @property
    def is_staff(self) -> bool:
        """Check if user is staff."""
        return self.role in [
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.MANAGER.value,
            UserRole.TEACHER.value,
        ]

    def __repr__(self) -> str:
        return f"<User {self.id}: {self.phone}>"

