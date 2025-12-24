"""
Notification model.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin
from shared.constants import NotificationType

if TYPE_CHECKING:
    from db.models.user import User


class Notification(Base, UUIDMixin, TimestampMixin):
    """Notification model."""

    # Recipient
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Content
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(
        String(50),
        default=NotificationType.INFO.value,
        nullable=False,
    )

    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Delivery
    sent_via_telegram: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Action URL (optional)
    action_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications",
        lazy="joined",
    )

    def mark_as_read(self) -> None:
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = datetime.utcnow()

    def __repr__(self) -> str:
        return f"<Notification {self.id}: {self.title}>"

