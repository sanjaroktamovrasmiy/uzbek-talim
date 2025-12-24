"""
Course service.
"""

from typing import Optional

from shared import NotFoundError
from shared.utils import slugify
from shared.constants import CourseStatus
from db.models import Course

from src.schemas.course import (
    CourseCreateRequest,
    CourseUpdateRequest,
    CourseResponse,
    CourseListResponse,
    CourseBriefResponse,
)
from src.schemas.common import PaginationParams
from src.repositories.course_repository import CourseRepository


class CourseService:
    """Course service."""

    def __init__(self, course_repo: CourseRepository):
        """Initialize service."""
        self.course_repo = course_repo

    async def get_course(self, course_id: str) -> CourseResponse:
        """
        Get course by ID or slug.

        Args:
            course_id: Course ID or slug

        Returns:
            Course response

        Raises:
            NotFoundError: If course not found
        """
        # Try by ID first
        course = await self.course_repo.get_by_id(course_id)
        if not course or course.deleted_at:
            # Try by slug
            course = await self.course_repo.get_by_slug(course_id)

        if not course or course.deleted_at:
            raise NotFoundError("Course", course_id)

        response = CourseResponse.model_validate(course)
        response.groups_count = len(course.groups) if course.groups else 0
        return response

    async def list_courses(
        self,
        pagination: PaginationParams,
        category: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> CourseListResponse:
        """
        List courses with filters.

        Args:
            pagination: Pagination parameters
            category: Filter by category
            status: Filter by status
            search: Search query

        Returns:
            Paginated course list
        """
        if search:
            courses = await self.course_repo.search(
                search,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(courses)
        elif category:
            courses = await self.course_repo.get_by_category(
                category,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(courses)
        else:
            # Default to published courses
            courses = await self.course_repo.get_published(
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.course_repo.count_published()

        items = [CourseBriefResponse.model_validate(c) for c in courses]

        return CourseListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_course(self, request: CourseCreateRequest) -> CourseResponse:
        """
        Create a new course.

        Args:
            request: Course creation data

        Returns:
            Created course
        """
        # Generate unique slug
        base_slug = slugify(request.name)
        slug = base_slug
        counter = 1

        while await self.course_repo.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        course = Course(
            slug=slug,
            name=request.name,
            description=request.description,
            short_description=request.short_description,
            duration_months=request.duration_months,
            lessons_per_week=request.lessons_per_week,
            lesson_duration_minutes=request.lesson_duration_minutes,
            price=request.price,
            discount_price=request.discount_price,
            level=request.level,
            category=request.category,
            tags=request.tags,
            status=CourseStatus.DRAFT.value,
        )

        await self.course_repo.create(course)
        return CourseResponse.model_validate(course)

    async def update_course(
        self,
        course_id: str,
        request: CourseUpdateRequest,
    ) -> CourseResponse:
        """
        Update course.

        Args:
            course_id: Course ID
            request: Update data

        Returns:
            Updated course

        Raises:
            NotFoundError: If course not found
        """
        course = await self.course_repo.get_by_id(course_id)
        if not course or course.deleted_at:
            raise NotFoundError("Course", course_id)

        # Update slug if name changed
        update_data = request.model_dump(exclude_unset=True)
        if "name" in update_data:
            update_data["slug"] = slugify(update_data["name"])

        await self.course_repo.update(course, **update_data)
        return CourseResponse.model_validate(course)

    async def delete_course(self, course_id: str) -> None:
        """
        Soft delete course.

        Args:
            course_id: Course ID

        Raises:
            NotFoundError: If course not found
        """
        course = await self.course_repo.get_by_id(course_id)
        if not course or course.deleted_at:
            raise NotFoundError("Course", course_id)

        await self.course_repo.soft_delete(course)

    async def publish_course(self, course_id: str) -> CourseResponse:
        """
        Publish course.

        Args:
            course_id: Course ID

        Returns:
            Published course

        Raises:
            NotFoundError: If course not found
        """
        course = await self.course_repo.get_by_id(course_id)
        if not course or course.deleted_at:
            raise NotFoundError("Course", course_id)

        await self.course_repo.update(course, status=CourseStatus.PUBLISHED.value)
        return CourseResponse.model_validate(course)

