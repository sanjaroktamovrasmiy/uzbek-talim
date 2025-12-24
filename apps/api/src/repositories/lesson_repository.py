"""
Lesson repository.
"""

from datetime import date
from typing import Optional, List

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from db.models import Lesson, Attendance
from src.repositories.base import BaseRepository


class LessonRepository(BaseRepository[Lesson]):
    """Lesson repository."""

    model = Lesson

    async def get_with_attendances(self, id: str) -> Optional[Lesson]:
        """Get lesson with attendances."""
        result = await self.session.execute(
            select(Lesson)
            .options(
                selectinload(Lesson.group),
                selectinload(Lesson.attendances),
            )
            .where(Lesson.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_group(
        self,
        group_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Lesson]:
        """Get lessons by group."""
        result = await self.session.execute(
            select(Lesson)
            .options(selectinload(Lesson.group))
            .where(Lesson.group_id == group_id)
            .order_by(Lesson.date.desc(), Lesson.start_time)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_date_range(
        self,
        group_id: Optional[str],
        date_from: date,
        date_to: date,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Lesson]:
        """Get lessons by date range."""
        query = (
            select(Lesson)
            .options(selectinload(Lesson.group))
            .where(Lesson.date >= date_from, Lesson.date <= date_to)
            .order_by(Lesson.date, Lesson.start_time)
            .offset(skip)
            .limit(limit)
        )

        if group_id:
            query = query.where(Lesson.group_id == group_id)

        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_today_lessons(self, group_id: Optional[str] = None) -> List[Lesson]:
        """Get today's lessons."""
        today = date.today()
        return await self.get_by_date_range(group_id, today, today)

    async def get_next_lesson(self, group_id: str) -> Optional[Lesson]:
        """Get next scheduled lesson for a group."""
        today = date.today()
        result = await self.session.execute(
            select(Lesson)
            .where(
                Lesson.group_id == group_id,
                Lesson.date >= today,
                Lesson.status == "scheduled",
            )
            .order_by(Lesson.date, Lesson.start_time)
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def count_by_group(self, group_id: str) -> int:
        """Count lessons by group."""
        result = await self.session.execute(
            select(func.count(Lesson.id)).where(Lesson.group_id == group_id)
        )
        return result.scalar() or 0

    async def create_attendance(self, attendance: Attendance) -> Attendance:
        """Create attendance record."""
        self.session.add(attendance)
        await self.session.flush()
        await self.session.refresh(attendance)
        return attendance

    async def get_attendance(
        self,
        lesson_id: str,
        student_id: str,
    ) -> Optional[Attendance]:
        """Get attendance record."""
        result = await self.session.execute(
            select(Attendance).where(
                Attendance.lesson_id == lesson_id,
                Attendance.student_id == student_id,
            )
        )
        return result.scalar_one_or_none()

