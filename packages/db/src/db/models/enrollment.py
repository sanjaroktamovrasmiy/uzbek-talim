"""
Enrollment model - tracks student course enrollments.
"""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin
from shared.constants import EnrollmentStatus

if TYPE_CHECKING:
    from db.models.user import User
    from db.models.course import Group


class Enrollment(Base, UUIDMixin, TimestampMixin):
    """Enrollment model."""

    # Relations
    student_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    group_id: Mapped[str] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Dates
    enrolled_at: Mapped[datetime] = mapped_column(Date, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(Date, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(50),
        default=EnrollmentStatus.PENDING.value,
        nullable=False,
        index=True,
    )

    # Financial
    agreed_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )
    discount_percent: Mapped[int] = mapped_column(
        default=0,
        nullable=False,
    )
    discount_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    student: Mapped["User"] = relationship(
        "User",
        back_populates="enrollments",
        lazy="joined",
    )
    group: Mapped["Group"] = relationship(
        "Group",
        back_populates="enrollments",
        lazy="joined",
    )

    @property
    def balance(self) -> Decimal:
        """Get remaining balance."""
        return self.agreed_price - self.paid_amount

    @property
    def is_paid(self) -> bool:
        """Check if fully paid."""
        return self.paid_amount >= self.agreed_price

    @property
    def is_active(self) -> bool:
        """Check if enrollment is active."""
        return self.status == EnrollmentStatus.ACTIVE.value

    def __repr__(self) -> str:
        return f"<Enrollment {self.id}: student={self.student_id}, group={self.group_id}>"

