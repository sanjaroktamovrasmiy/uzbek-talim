"""
Base repository with common CRUD operations.
"""

from typing import Generic, TypeVar, Type, List, Optional, Any

from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import Base


ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""

    model: Type[ModelType]

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        """Get entity by ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> List[ModelType]:
        """Get all entities with pagination."""
        query = select(self.model)

        # Apply filters
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self, **filters: Any) -> int:
        """Count entities."""
        query = select(func.count(self.model.id))

        # Apply filters
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(self, obj: ModelType) -> ModelType:
        """Create new entity."""
        self.session.add(obj)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def update(self, obj: ModelType, **kwargs: Any) -> ModelType:
        """Update entity."""
        for key, value in kwargs.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, id: str) -> bool:
        """Hard delete entity."""
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        return result.rowcount > 0

    async def soft_delete(self, obj: ModelType) -> ModelType:
        """Soft delete entity (set deleted_at)."""
        from datetime import datetime, timezone

        if hasattr(obj, "deleted_at"):
            obj.deleted_at = datetime.now(timezone.utc)
            await self.session.flush()
        return obj

    async def exists(self, id: str) -> bool:
        """Check if entity exists."""
        result = await self.session.execute(
            select(func.count(self.model.id)).where(self.model.id == id)
        )
        return (result.scalar() or 0) > 0

