"""
Test/Exam models.
"""

from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base, TimestampMixin, UUIDMixin, SoftDeleteMixin

if TYPE_CHECKING:
    from db.models.course import Course
    from db.models.test_result import TestResult


class Test(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    """Test/Exam model."""

    course_id: Mapped[str] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[int] = mapped_column(Integer, nullable=False, default=30)  # minutes
    max_score: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    available_from: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    available_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="tests")
    questions: Mapped[list["TestQuestion"]] = relationship(
        "TestQuestion",
        back_populates="test",
        cascade="all, delete-orphan",
        order_by="TestQuestion.order_index",
    )
    results: Mapped[list["TestResult"]] = relationship(
        "TestResult",
        back_populates="test",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Test {self.id}: {self.title}>"


class TestQuestion(Base, UUIDMixin, TimestampMixin):
    """Test question model."""

    test_id: Mapped[str] = mapped_column(
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="single_choice",  # single_choice, multiple_choice, text
    )
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    points: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Relationships
    test: Mapped["Test"] = relationship("Test", back_populates="questions")
    options: Mapped[list["TestQuestionOption"]] = relationship(
        "TestQuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="TestQuestionOption.order_index",
    )

    def __repr__(self) -> str:
        return f"<TestQuestion {self.id}: {self.question_text[:50]}>"


class TestQuestionOption(Base, UUIDMixin, TimestampMixin):
    """Test question option/answer choice."""

    question_id: Mapped[str] = mapped_column(
        ForeignKey("test_questions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    question: Mapped["TestQuestion"] = relationship("TestQuestion", back_populates="options")

    def __repr__(self) -> str:
        return f"<TestQuestionOption {self.id}: {self.option_text[:50]}>"


