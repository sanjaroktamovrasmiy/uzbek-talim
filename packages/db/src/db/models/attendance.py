"""
Attendance model.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin
from shared.constants import AttendanceStatus

if TYPE_CHECKING:
    from db.models.user import User
    from db.models.lesson import Lesson


class Attendance(Base, UUIDMixin, TimestampMixin):
    """Attendance model."""

    __tablename__ = "attendances"

    # Relations
    student_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lesson_id: Mapped[str] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default=AttendanceStatus.ABSENT.value,
        nullable=False,
    )

    # Grading
    grade: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )  # 1-100 or null
    homework_grade: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    lesson: Mapped["Lesson"] = relationship(
        "Lesson",
        back_populates="attendances",
        lazy="joined",
    )

    @property
    def is_present(self) -> bool:
        """Check if student was present."""
        return self.status in [
            AttendanceStatus.PRESENT.value,
            AttendanceStatus.LATE.value,
        ]

    def __repr__(self) -> str:
        return f"<Attendance {self.id}: student={self.student_id}, status={self.status}>"

