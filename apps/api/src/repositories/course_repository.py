"""
Course repository.
"""

from typing import Optional, List

from sqlalchemy import select, func, or_

from db.models import Course
from shared.constants import CourseStatus
from src.repositories.base import BaseRepository


class CourseRepository(BaseRepository[Course]):
    """Course repository."""

    model = Course

    async def get_by_slug(self, slug: str) -> Optional[Course]:
        """Get course by slug."""
        result = await self.session.execute(
            select(Course).where(Course.slug == slug, Course.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_published(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Get published courses."""
        result = await self.session.execute(
            select(Course)
            .where(
                Course.status == CourseStatus.PUBLISHED.value,
                Course.deleted_at.is_(None),
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_featured(self, limit: int = 6) -> List[Course]:
        """Get featured courses."""
        result = await self.session.execute(
            select(Course)
            .where(
                Course.is_featured.is_(True),
                Course.status == CourseStatus.PUBLISHED.value,
                Course.deleted_at.is_(None),
            )
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_category(
        self,
        category: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Get courses by category."""
        result = await self.session.execute(
            select(Course)
            .where(
                Course.category == category,
                Course.status == CourseStatus.PUBLISHED.value,
                Course.deleted_at.is_(None),
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def search(
        self,
        query: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Search courses."""
        search_pattern = f"%{query}%"
        result = await self.session.execute(
            select(Course)
            .where(
                Course.deleted_at.is_(None),
                or_(
                    Course.name.ilike(search_pattern),
                    Course.description.ilike(search_pattern),
                    Course.tags.ilike(search_pattern),
                ),
            )
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def count_published(self) -> int:
        """Count published courses."""
        result = await self.session.execute(
            select(func.count(Course.id)).where(
                Course.status == CourseStatus.PUBLISHED.value,
                Course.deleted_at.is_(None),
            )
        )
        return result.scalar() or 0

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Get all courses (not deleted)."""
        result = await self.session.execute(
            select(Course)
            .where(Course.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
            .order_by(Course.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_all(self) -> int:
        """Count all courses (not deleted)."""
        result = await self.session.execute(
            select(func.count(Course.id)).where(Course.deleted_at.is_(None))
        )
        return result.scalar() or 0

    async def get_by_status(
        self,
        status: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Get courses by status."""
        result = await self.session.execute(
            select(Course)
            .where(
                Course.status == status,
                Course.deleted_at.is_(None),
            )
            .offset(skip)
            .limit(limit)
            .order_by(Course.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_by_status(self, status: str) -> int:
        """Count courses by status."""
        result = await self.session.execute(
            select(func.count(Course.id)).where(
                Course.status == status,
                Course.deleted_at.is_(None),
            )
        )
        return result.scalar() or 0

    async def get_by_category_and_status(
        self,
        category: str,
        status: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Course]:
        """Get courses by category and status."""
        result = await self.session.execute(
            select(Course)
            .where(
                Course.category == category,
                Course.status == status,
                Course.deleted_at.is_(None),
            )
            .offset(skip)
            .limit(limit)
            .order_by(Course.created_at.desc())
        )
        return list(result.scalars().all())

    async def count_by_category_and_status(self, category: str, status: str) -> int:
        """Count courses by category and status."""
        result = await self.session.execute(
            select(func.count(Course.id)).where(
                Course.category == category,
                Course.status == status,
                Course.deleted_at.is_(None),
            )
        )
        return result.scalar() or 0

