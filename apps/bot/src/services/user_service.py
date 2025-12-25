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

        Args:
            telegram_id: Telegram user ID
            telegram_username: Telegram username

        Returns:
            User instance
        """
        user = await self.repo.get_by_telegram_id(telegram_id)

        if not user:
            # Create new user with placeholder phone
            user = User(
                phone=f"+998000000000",  # Placeholder, will be updated during registration
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
    ) -> User:
        """
        Register user with phone number.

        Args:
            telegram_id: Telegram user ID
            phone: Phone number
            first_name: First name
            last_name: Last name
            telegram_username: Telegram username

        Returns:
            Created/updated user
        """
        # Check if phone already exists
        existing_by_phone = await self.repo.get_by_phone(phone)
        if existing_by_phone and existing_by_phone.telegram_id != telegram_id:
            raise ValueError("Bu telefon raqam allaqachon ro'yxatdan o'tgan")

        # Get or create user by Telegram ID
        user = await self.repo.get_by_telegram_id(telegram_id)

        if user:
            # Update existing user
            await self.repo.update(
                user,
                phone=phone,
                first_name=first_name,
                last_name=last_name,
                telegram_username=telegram_username,
                role=UserRole.STUDENT.value,
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
                role=UserRole.STUDENT.value,
                is_verified=True,
            )
            await self.repo.create(user)

        return user

    async def get_user_by_telegram_id(self, telegram_id: int) -> User | None:
        """Get user by Telegram ID."""
        return await self.repo.get_by_telegram_id(telegram_id)

