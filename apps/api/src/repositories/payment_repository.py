"""
Payment repository.
"""

from typing import Optional, List
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from db.models import Payment
from shared.constants import PaymentStatus
from src.repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    """Payment repository."""

    model = Payment

    async def get_with_user(self, id: str) -> Optional[Payment]:
        """Get payment with user info."""
        result = await self.session.execute(
            select(Payment)
            .options(selectinload(Payment.user))
            .where(Payment.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Payment]:
        """Get payments by user."""
        result = await self.session.execute(
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_enrollment(self, enrollment_id: str) -> List[Payment]:
        """Get payments by enrollment."""
        result = await self.session.execute(
            select(Payment)
            .where(Payment.enrollment_id == enrollment_id)
            .order_by(Payment.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_status(
        self,
        status: PaymentStatus,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Payment]:
        """Get payments by status."""
        result = await self.session.execute(
            select(Payment)
            .options(selectinload(Payment.user))
            .where(Payment.status == status.value)
            .order_by(Payment.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_pending_payments(
        self,
        skip: int = 0,
        limit: int = 20,
    ) -> List[Payment]:
        """Get pending payments."""
        return await self.get_by_status(PaymentStatus.PENDING, skip, limit)

    async def get_by_transaction_id(self, transaction_id: str) -> Optional[Payment]:
        """Get payment by transaction ID."""
        result = await self.session.execute(
            select(Payment).where(Payment.transaction_id == transaction_id)
        )
        return result.scalar_one_or_none()

    async def sum_by_user(self, user_id: str) -> Decimal:
        """Sum completed payments for user."""
        result = await self.session.execute(
            select(func.sum(Payment.amount)).where(
                Payment.user_id == user_id,
                Payment.status == PaymentStatus.COMPLETED.value,
            )
        )
        return result.scalar() or Decimal(0)

    async def sum_by_enrollment(self, enrollment_id: str) -> Decimal:
        """Sum completed payments for enrollment."""
        result = await self.session.execute(
            select(func.sum(Payment.amount)).where(
                Payment.enrollment_id == enrollment_id,
                Payment.status == PaymentStatus.COMPLETED.value,
            )
        )
        return result.scalar() or Decimal(0)

    async def count_by_status(self, status: PaymentStatus) -> int:
        """Count payments by status."""
        result = await self.session.execute(
            select(func.count(Payment.id)).where(Payment.status == status.value)
        )
        return result.scalar() or 0

