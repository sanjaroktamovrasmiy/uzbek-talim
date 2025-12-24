"""
User service.
"""

from typing import Optional

from shared import NotFoundError, ValidationError
from shared.utils import generate_password
from db.models import User

from src.core.security import hash_password
from src.schemas.user import (
    UserCreateRequest,
    UserUpdateRequest,
    UserResponse,
    UserListResponse,
    UserBriefResponse,
)
from src.schemas.common import PaginationParams
from src.repositories.user_repository import UserRepository


class UserService:
    """User service."""

    def __init__(self, user_repo: UserRepository):
        """Initialize service."""
        self.user_repo = user_repo

    async def get_user(self, user_id: str) -> UserResponse:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            User response

        Raises:
            NotFoundError: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.deleted_at:
            raise NotFoundError("User", user_id)
        return UserResponse.model_validate(user)

    async def list_users(
        self,
        pagination: PaginationParams,
        role: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> UserListResponse:
        """
        List users with filters.

        Args:
            pagination: Pagination parameters
            role: Filter by role
            search: Search query
            is_active: Filter by active status

        Returns:
            Paginated user list
        """
        filters = {}
        if is_active is not None:
            filters["is_active"] = is_active

        if search:
            users = await self.user_repo.search(
                search,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(users)  # Approximate for search
        elif role:
            users = await self.user_repo.get_by_role(
                role,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.user_repo.count_by_role(role)
        else:
            users = await self.user_repo.get_all(
                skip=pagination.offset,
                limit=pagination.size,
                **filters,
            )
            total = await self.user_repo.count(**filters)

        items = [UserBriefResponse.model_validate(u) for u in users]

        return UserListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_user(self, request: UserCreateRequest) -> UserResponse:
        """
        Create a new user.

        Args:
            request: User creation data

        Returns:
            Created user

        Raises:
            ValidationError: If phone already exists
        """
        # Check if phone exists
        existing = await self.user_repo.get_by_phone(request.phone)
        if existing:
            raise ValidationError("Phone number already registered")

        # Generate password if not provided
        password = request.password or generate_password()

        user = User(
            phone=request.phone,
            first_name=request.first_name,
            last_name=request.last_name,
            middle_name=request.middle_name,
            email=request.email,
            birth_date=request.birth_date,
            bio=request.bio,
            region=request.region,
            city=request.city,
            address=request.address,
            role=request.role.value,
            password_hash=hash_password(password),
            is_verified=True,  # Admin-created users are verified
        )

        await self.user_repo.create(user)
        return UserResponse.model_validate(user)

    async def update_user(
        self,
        user_id: str,
        request: UserUpdateRequest,
    ) -> UserResponse:
        """
        Update user.

        Args:
            user_id: User ID
            request: Update data

        Returns:
            Updated user

        Raises:
            NotFoundError: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.deleted_at:
            raise NotFoundError("User", user_id)

        # Update only provided fields
        update_data = request.model_dump(exclude_unset=True)
        await self.user_repo.update(user, **update_data)

        return UserResponse.model_validate(user)

    async def delete_user(self, user_id: str) -> None:
        """
        Soft delete user.

        Args:
            user_id: User ID

        Raises:
            NotFoundError: If user not found
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.deleted_at:
            raise NotFoundError("User", user_id)

        await self.user_repo.soft_delete(user)

