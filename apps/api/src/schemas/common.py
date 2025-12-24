"""
Common schemas used across the API.
"""

from typing import Generic, List, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")

    @property
    def offset(self) -> int:
        """Calculate offset."""
        return (self.page - 1) * self.size


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    items: List[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        size: int,
    ) -> "PaginatedResponse[T]":
        """Create paginated response."""
        pages = (total + size - 1) // size if size > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
        )


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str


class ErrorDetail(BaseModel):
    """Error detail."""

    code: str
    message: str
    details: dict = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Error response wrapper."""

    error: ErrorDetail

