"""
Test repository.
"""

from typing import Optional, List

from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from db.models import Test, TestQuestion, TestQuestionOption
from src.repositories.base import BaseRepository


class TestRepository(BaseRepository[Test]):
    """Test repository."""

    model = Test

    async def get_with_questions(self, test_id: str) -> Optional[Test]:
        """Get test with questions and options."""
        result = await self.session.execute(
            select(Test)
            .where(Test.id == test_id, Test.deleted_at.is_(None))
            .options(
                selectinload(Test.questions).selectinload(TestQuestion.options)
            )
        )
        return result.scalar_one_or_none()

    async def list_by_course(
        self,
        course_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Test]:
        """List tests by course."""
        result = await self.session.execute(
            select(Test)
            .where(Test.course_id == course_id, Test.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .order_by(Test.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_by_course(self, course_id: str) -> int:
        """Count tests by course."""
        result = await self.session.execute(
            select(func.count(Test.id)).where(
                Test.course_id == course_id, Test.deleted_at.is_(None)
            )
        )
        return result.scalar() or 0


class TestQuestionRepository(BaseRepository[TestQuestion]):
    """Test question repository."""

    model = TestQuestion

    async def get_with_options(self, question_id: str) -> Optional[TestQuestion]:
        """Get question with options."""
        result = await self.session.execute(
            select(TestQuestion)
            .where(TestQuestion.id == question_id)
            .options(selectinload(TestQuestion.options))
        )
        return result.scalar_one_or_none()


class TestQuestionOptionRepository(BaseRepository[TestQuestionOption]):
    """Test question option repository."""

    model = TestQuestionOption

