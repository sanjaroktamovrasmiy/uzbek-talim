"""
Group service.
"""

from typing import Optional
from datetime import date

from shared import NotFoundError, ValidationError
from shared.constants import EnrollmentStatus
from db.models import Group, Enrollment

from src.schemas.group import (
    GroupCreateRequest,
    GroupUpdateRequest,
    GroupResponse,
    GroupListResponse,
    GroupBriefResponse,
    EnrollStudentRequest,
)
from src.schemas.common import PaginationParams
from src.repositories.group_repository import GroupRepository


class GroupService:
    """Group service."""

    def __init__(self, group_repo: GroupRepository):
        """Initialize service."""
        self.group_repo = group_repo

    async def get_group(self, group_id: str) -> GroupResponse:
        """
        Get group by ID.

        Args:
            group_id: Group ID

        Returns:
            Group response

        Raises:
            NotFoundError: If group not found
        """
        group = await self.group_repo.get_with_relations(group_id)
        if not group:
            raise NotFoundError("Group", group_id)

        response = GroupResponse.model_validate(group)
        response.course_name = group.course.name if group.course else ""
        response.current_students = group.current_students_count
        response.has_capacity = group.has_capacity
        return response

    async def list_groups(
        self,
        pagination: PaginationParams,
        course_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> GroupListResponse:
        """
        List groups with filters.

        Args:
            pagination: Pagination parameters
            course_id: Filter by course
            is_active: Filter by active status

        Returns:
            Paginated group list
        """
        if course_id:
            groups = await self.group_repo.get_by_course(
                course_id,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.group_repo.count_by_course(course_id)
        elif is_active:
            groups = await self.group_repo.get_active_groups(
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(groups)
        else:
            groups = await self.group_repo.get_all(
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.group_repo.count()

        items = []
        for g in groups:
            item = GroupBriefResponse.model_validate(g)
            item.course_name = g.course.name if g.course else ""
            item.current_students = g.current_students_count
            items.append(item)

        return GroupListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_group(self, request: GroupCreateRequest) -> GroupResponse:
        """
        Create a new group.

        Args:
            request: Group creation data

        Returns:
            Created group
        """
        group = Group(
            name=request.name,
            description=request.description,
            course_id=request.course_id,
            teacher_id=request.teacher_id,
            start_date=request.start_date,
            end_date=request.end_date,
            start_time=request.start_time,
            end_time=request.end_time,
            days_of_week=request.days_of_week,
            max_students=request.max_students,
            room=request.room,
        )

        await self.group_repo.create(group)
        return await self.get_group(group.id)

    async def update_group(
        self,
        group_id: str,
        request: GroupUpdateRequest,
    ) -> GroupResponse:
        """
        Update group.

        Args:
            group_id: Group ID
            request: Update data

        Returns:
            Updated group

        Raises:
            NotFoundError: If group not found
        """
        group = await self.group_repo.get_by_id(group_id)
        if not group or group.deleted_at:
            raise NotFoundError("Group", group_id)

        update_data = request.model_dump(exclude_unset=True)
        await self.group_repo.update(group, **update_data)

        return await self.get_group(group_id)

    async def delete_group(self, group_id: str) -> None:
        """
        Soft delete group.

        Args:
            group_id: Group ID

        Raises:
            NotFoundError: If group not found
        """
        group = await self.group_repo.get_by_id(group_id)
        if not group or group.deleted_at:
            raise NotFoundError("Group", group_id)

        await self.group_repo.soft_delete(group)

    async def enroll_student(
        self,
        group_id: str,
        request: EnrollStudentRequest,
    ) -> None:
        """
        Enroll student to group.

        Args:
            group_id: Group ID
            request: Enrollment data

        Raises:
            NotFoundError: If group not found
            ValidationError: If group is full
        """
        group = await self.group_repo.get_with_relations(group_id)
        if not group:
            raise NotFoundError("Group", group_id)

        if not group.has_capacity:
            raise ValidationError("Group is full")

        # Create enrollment
        enrollment = Enrollment(
            student_id=request.student_id,
            group_id=group_id,
            enrolled_at=date.today(),
            agreed_price=request.agreed_price,
            discount_percent=request.discount_percent,
            discount_reason=request.discount_reason,
            notes=request.notes,
            status=EnrollmentStatus.PENDING.value,
        )

        self.group_repo.session.add(enrollment)
        await self.group_repo.session.flush()

