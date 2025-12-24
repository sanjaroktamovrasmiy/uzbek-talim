"""
Lesson service.
"""

from datetime import date
from typing import Optional

from shared import NotFoundError
from db.models import User, Lesson, Attendance

from src.schemas.lesson import (
    LessonCreateRequest,
    LessonUpdateRequest,
    LessonResponse,
    LessonListResponse,
    LessonBriefResponse,
    AttendanceRequest,
)
from src.schemas.common import PaginationParams
from src.repositories.lesson_repository import LessonRepository


class LessonService:
    """Lesson service."""

    def __init__(self, lesson_repo: LessonRepository):
        """Initialize service."""
        self.lesson_repo = lesson_repo

    async def get_lesson(self, lesson_id: str, user: User) -> LessonResponse:
        """
        Get lesson by ID.

        Args:
            lesson_id: Lesson ID
            user: Current user

        Returns:
            Lesson response

        Raises:
            NotFoundError: If lesson not found
        """
        lesson = await self.lesson_repo.get_with_attendances(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson", lesson_id)

        response = LessonResponse.model_validate(lesson)
        response.group_name = lesson.group.name if lesson.group else ""
        return response

    async def list_lessons(
        self,
        user: User,
        pagination: PaginationParams,
        group_id: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
    ) -> LessonListResponse:
        """
        List lessons with filters.

        Args:
            user: Current user
            pagination: Pagination parameters
            group_id: Filter by group
            date_from: Start date filter
            date_to: End date filter

        Returns:
            Paginated lesson list
        """
        # Parse dates
        from_date = date.fromisoformat(date_from) if date_from else date.today()
        to_date = date.fromisoformat(date_to) if date_to else from_date

        if group_id:
            lessons = await self.lesson_repo.get_by_group(
                group_id,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.lesson_repo.count_by_group(group_id)
        else:
            lessons = await self.lesson_repo.get_by_date_range(
                group_id=None,
                date_from=from_date,
                date_to=to_date,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(lessons)

        items = []
        for lesson in lessons:
            item = LessonBriefResponse.model_validate(lesson)
            item.group_name = lesson.group.name if lesson.group else ""
            items.append(item)

        return LessonListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_lesson(self, request: LessonCreateRequest) -> LessonResponse:
        """
        Create a new lesson.

        Args:
            request: Lesson creation data

        Returns:
            Created lesson
        """
        lesson = Lesson(
            title=request.title,
            description=request.description,
            lesson_number=request.lesson_number,
            group_id=request.group_id,
            date=request.date,
            start_time=request.start_time,
            end_time=request.end_time,
            homework=request.homework,
        )

        await self.lesson_repo.create(lesson)

        # Reload with relations
        lesson = await self.lesson_repo.get_with_attendances(lesson.id)
        response = LessonResponse.model_validate(lesson)
        response.group_name = lesson.group.name if lesson.group else ""
        return response

    async def update_lesson(
        self,
        lesson_id: str,
        request: LessonUpdateRequest,
    ) -> LessonResponse:
        """
        Update lesson.

        Args:
            lesson_id: Lesson ID
            request: Update data

        Returns:
            Updated lesson

        Raises:
            NotFoundError: If lesson not found
        """
        lesson = await self.lesson_repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson", lesson_id)

        update_data = request.model_dump(exclude_unset=True)

        # Convert status enum to string
        if "status" in update_data and update_data["status"]:
            update_data["status"] = update_data["status"].value

        await self.lesson_repo.update(lesson, **update_data)

        # Reload with relations
        lesson = await self.lesson_repo.get_with_attendances(lesson_id)
        response = LessonResponse.model_validate(lesson)
        response.group_name = lesson.group.name if lesson.group else ""
        return response

    async def mark_attendance(
        self,
        lesson_id: str,
        request: AttendanceRequest,
    ) -> None:
        """
        Mark attendance for lesson.

        Args:
            lesson_id: Lesson ID
            request: Attendance data

        Raises:
            NotFoundError: If lesson not found
        """
        lesson = await self.lesson_repo.get_by_id(lesson_id)
        if not lesson:
            raise NotFoundError("Lesson", lesson_id)

        for student_attendance in request.attendances:
            # Check if attendance exists
            existing = await self.lesson_repo.get_attendance(
                lesson_id,
                student_attendance.student_id,
            )

            if existing:
                # Update existing
                await self.lesson_repo.update(
                    existing,
                    status=student_attendance.status.value,
                    grade=student_attendance.grade,
                    homework_grade=student_attendance.homework_grade,
                    notes=student_attendance.notes,
                )
            else:
                # Create new
                attendance = Attendance(
                    lesson_id=lesson_id,
                    student_id=student_attendance.student_id,
                    status=student_attendance.status.value,
                    grade=student_attendance.grade,
                    homework_grade=student_attendance.homework_grade,
                    notes=student_attendance.notes,
                )
                await self.lesson_repo.create_attendance(attendance)

