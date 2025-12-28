"""
User service for bot.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from db.models import User
from src.repositories.user_repository import UserRepository
from shared.constants import UserRole


class UserService:
    """User service for bot operations."""

    def __init__(self, session: AsyncSession):
        """Initialize service."""
        self.repo = UserRepository(session)

    async def get_or_create_by_telegram(
        self,
        telegram_id: int,
        telegram_username: str | None = None,
    ) -> User:
        """
        Get user by Telegram ID or create new one.
        If user was soft-deleted, restore it.

        Args:
            telegram_id: Telegram user ID
            telegram_username: Telegram username

        Returns:
            User instance
        """
        # First try to get active user
        user = await self.repo.get_by_telegram_id(telegram_id)

        if not user:
            # Check if user exists but was deleted
            deleted_user = await self.repo.get_by_telegram_id_include_deleted(telegram_id)
            if deleted_user:
                # Restore deleted user but reset to guest status (since they deleted their account)
                user = await self.repo.restore(deleted_user)
                # Reset user to guest status with placeholder phone
                # Generate unique placeholder phone based on telegram_id to avoid conflicts
                placeholder_phone = f"+998{telegram_id % 1000000000:09d}"
                await self.repo.update(
                    user,
                    phone=placeholder_phone,
                    telegram_username=telegram_username,
                    role=UserRole.GUEST.value,
                    is_verified=False,
                    # Keep first_name and last_name as they were (Telegram user info)
                )
            else:
                # Create new user with placeholder phone
                user = User(
                    phone=f"+998{telegram_id % 1000000000:09d}",  # Generate unique placeholder phone
                    first_name="Telegram",
                    last_name="User",
                    telegram_id=telegram_id,
                    telegram_username=telegram_username,
                    role=UserRole.GUEST.value,
                    is_verified=False,
                )
                await self.repo.create(user)

        return user

    async def register_user(
        self,
        telegram_id: int,
        phone: str,
        first_name: str,
        last_name: str,
        telegram_username: str | None = None,
        role: str | None = None,
    ) -> User:
        """
        Register user with phone number.

        Args:
            telegram_id: Telegram user ID
            phone: Phone number
            first_name: First name
            last_name: Last name
            telegram_username: Telegram username
            role: User role (student or teacher), defaults to STUDENT

        Returns:
            Created/updated user
        """
        # Check if phone already exists (excluding current telegram_id)
        existing_by_phone = await self.repo.get_by_phone(phone)
        if existing_by_phone and existing_by_phone.telegram_id != telegram_id:
            raise ValueError("Bu telefon raqam allaqachon ro'yxatdan o'tgan")

        # Default role to STUDENT if not provided
        if role is None:
            role = UserRole.STUDENT.value
        elif role not in [UserRole.STUDENT.value, UserRole.TEACHER.value]:
            role = UserRole.STUDENT.value

        # Get or create user by Telegram ID (including deleted)
        user = await self.repo.get_by_telegram_id(telegram_id)
        
        if not user:
            # Check if user exists but was deleted
            deleted_user = await self.repo.get_by_telegram_id_include_deleted(telegram_id)
            if deleted_user:
                # Restore and update deleted user
                user = await self.repo.restore(deleted_user)
                await self.repo.update(
                    user,
                    phone=phone,
                    first_name=first_name,
                    last_name=last_name,
                    telegram_username=telegram_username,
                    role=role,
                    is_verified=True,
                )
            else:
                # Create new user
                user = User(
                    phone=phone,
                    first_name=first_name,
                    last_name=last_name,
                    telegram_id=telegram_id,
                    telegram_username=telegram_username,
                    role=role,
                    is_verified=True,
                )
                await self.repo.create(user)
        else:
            # Update existing user
            await self.repo.update(
                user,
                phone=phone,
                first_name=first_name,
                last_name=last_name,
                telegram_username=telegram_username,
                role=role,
                is_verified=True,
            )

        return user

    async def get_user_by_telegram_id(self, telegram_id: int) -> User | None:
        """Get user by Telegram ID."""
        return await self.repo.get_by_telegram_id(telegram_id)

