"""
Course and Group models.
"""

from datetime import datetime, time
from decimal import Decimal
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Time,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin, SlugMixin
from shared.constants import CourseStatus

if TYPE_CHECKING:
    from db.models.lesson import Lesson
    from db.models.enrollment import Enrollment
    from db.models.test import Test


class Course(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin, SlugMixin):
    """Course model."""

    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Course details
    duration_months: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    lessons_per_week: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    lesson_duration_minutes: Mapped[int] = mapped_column(Integer, default=90, nullable=False)

    # Pricing
    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )
    discount_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default=CourseStatus.PUBLISHED.value,
        nullable=False,
        index=True,
    )
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Meta
    level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    tags: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    groups: Mapped[List["Group"]] = relationship(
        "Group",
        back_populates="course",
        lazy="selectin",
    )
    tests: Mapped[List["Test"]] = relationship(
        "Test",
        back_populates="course",
        lazy="selectin",
    )

    @property
    def current_price(self) -> Decimal:
        """Get current price (discount or regular)."""
        return self.discount_price or self.price

    @property
    def is_published(self) -> bool:
        """Check if course is published."""
        return self.status == CourseStatus.PUBLISHED.value

    def __repr__(self) -> str:
        return f"<Course {self.id}: {self.name}>"


class Group(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Group model - students study in groups."""

    __tablename__ = "groups"

    # Basic info
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Course relation
    course_id: Mapped[str] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Teacher
    teacher_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Schedule
    start_date: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    days_of_week: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )  # e.g., "1,3,5" for Mon, Wed, Fri

    # Capacity
    max_students: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Room
    room: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Relationships
    course: Mapped["Course"] = relationship(
        "Course",
        back_populates="groups",
        lazy="joined",
    )
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson",
        back_populates="group",
        lazy="selectin",
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment",
        back_populates="group",
        lazy="selectin",
    )

    @property
    def current_students_count(self) -> int:
        """Get current number of enrolled students."""
        from shared.constants import EnrollmentStatus
        return len([e for e in self.enrollments if e.status == EnrollmentStatus.ACTIVE.value])

    @property
    def has_capacity(self) -> bool:
        """Check if group has capacity for more students."""
        return self.current_students_count < self.max_students

    def __repr__(self) -> str:
        return f"<Group {self.id}: {self.name}>"

