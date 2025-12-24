"""
Lesson model.
"""

from datetime import datetime, time
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import Date, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin
from shared.constants import LessonStatus

if TYPE_CHECKING:
    from db.models.course import Group
    from db.models.attendance import Attendance


class Lesson(Base, UUIDMixin, TimestampMixin):
    """Lesson model."""

    # Basic info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lesson_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Group relation
    group_id: Mapped[str] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Schedule
    date: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default=LessonStatus.SCHEDULED.value,
        nullable=False,
        index=True,
    )

    # Content
    materials_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    homework: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Teacher override (if different from group teacher)
    teacher_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    group: Mapped["Group"] = relationship(
        "Group",
        back_populates="lessons",
        lazy="joined",
    )
    attendances: Mapped[List["Attendance"]] = relationship(
        "Attendance",
        back_populates="lesson",
        lazy="selectin",
    )

    @property
    def is_completed(self) -> bool:
        """Check if lesson is completed."""
        return self.status == LessonStatus.COMPLETED.value

    def __repr__(self) -> str:
        return f"<Lesson {self.id}: {self.title}>"

