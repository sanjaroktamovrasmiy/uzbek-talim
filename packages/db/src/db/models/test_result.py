"""
Test result model.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Integer, Float, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.test import Test
    from db.models.user import User


class TestResult(Base, UUIDMixin, TimestampMixin):
    """Test result model."""

    test_id: Mapped[str] = mapped_column(
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_score: Mapped[int] = mapped_column(Integer, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    answers: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)  # {question_id: [option_ids]}

    # Relationships
    test: Mapped["Test"] = relationship("Test", back_populates="results")
    user: Mapped["User"] = relationship("User", back_populates="test_results")

    def __repr__(self) -> str:
        return f"<TestResult {self.id}: {self.score}/{self.max_score}>"

