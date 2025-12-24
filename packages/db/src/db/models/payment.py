"""
Payment model.
"""

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin
from shared.constants import PaymentStatus, PaymentMethod

if TYPE_CHECKING:
    from db.models.user import User
    from db.models.enrollment import Enrollment


class Payment(Base, UUIDMixin, TimestampMixin):
    """Payment model."""

    # Relations
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enrollment_id: Mapped[Optional[str]] = mapped_column(
        ForeignKey("enrollments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Amount
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    currency: Mapped[str] = mapped_column(
        String(3),
        default="UZS",
        nullable=False,
    )

    # Payment details
    method: Mapped[str] = mapped_column(
        String(50),
        default=PaymentMethod.CASH.value,
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default=PaymentStatus.PENDING.value,
        nullable=False,
        index=True,
    )

    # Transaction info
    transaction_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
    )
    external_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )  # Payme/Click transaction ID

    # Timestamps
    paid_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Notes
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Processed by (for cash payments)
    processed_by: Mapped[Optional[str]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Receipt
    receipt_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="payments",
        foreign_keys=[user_id],
        lazy="joined",
    )

    @property
    def is_completed(self) -> bool:
        """Check if payment is completed."""
        return self.status == PaymentStatus.COMPLETED.value

    def __repr__(self) -> str:
        return f"<Payment {self.id}: {self.amount} {self.currency}>"

