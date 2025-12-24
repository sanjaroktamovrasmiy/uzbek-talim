"""
Group repository.
"""

from typing import Optional, List

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from db.models import Group, Enrollment
from src.repositories.base import BaseRepository


class GroupRepository(BaseRepository[Group]):
    """Group repository."""

    model = Group

    async def get_with_relations(self, id: str) -> Optional[Group]:
        """Get group with course and enrollments."""
        result = await self.session.execute(
            select(Group)
            .options(
                selectinload(Group.course),
                selectinload(Group.enrollments),
            )
            .where(Group.id == id, Group.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def get_by_course(
        self,
        course_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Group]:
        """Get groups by course."""
        result = await self.session.execute(
            select(Group)
            .options(selectinload(Group.course))
            .where(Group.course_id == course_id, Group.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_active_groups(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Group]:
        """Get active groups."""
        result = await self.session.execute(
            select(Group)
            .options(selectinload(Group.course))
            .where(Group.is_active.is_(True), Group.deleted_at.is_(None))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_groups_with_capacity(
        self,
        course_id: Optional[str] = None,
    ) -> List[Group]:
        """Get groups that have capacity for new students."""
        query = (
            select(Group)
            .options(selectinload(Group.enrollments))
            .where(Group.is_active.is_(True), Group.deleted_at.is_(None))
        )

        if course_id:
            query = query.where(Group.course_id == course_id)

        result = await self.session.execute(query)
        groups = list(result.scalars().all())

        # Filter by capacity
        return [g for g in groups if g.has_capacity]

    async def get_student_groups(self, student_id: str) -> List[Group]:
        """Get groups where student is enrolled."""
        result = await self.session.execute(
            select(Group)
            .join(Enrollment)
            .options(selectinload(Group.course))
            .where(
                Enrollment.student_id == student_id,
                Enrollment.status == "active",
                Group.deleted_at.is_(None),
            )
        )
        return list(result.scalars().all())

    async def count_by_course(self, course_id: str) -> int:
        """Count groups by course."""
        result = await self.session.execute(
            select(func.count(Group.id)).where(
                Group.course_id == course_id, Group.deleted_at.is_(None)
            )
        )
        return result.scalar() or 0

