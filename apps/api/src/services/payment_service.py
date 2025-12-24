"""
Payment service.
"""

from datetime import datetime, timezone
from typing import Optional

from shared import NotFoundError, PermissionDeniedError
from shared.constants import PaymentStatus
from shared.utils import generate_uuid
from db.models import User, Payment

from src.schemas.payment import (
    PaymentCreateRequest,
    PaymentResponse,
    PaymentListResponse,
    PaymentBriefResponse,
)
from src.schemas.common import PaginationParams
from src.repositories.payment_repository import PaymentRepository


class PaymentService:
    """Payment service."""

    def __init__(self, payment_repo: PaymentRepository):
        """Initialize service."""
        self.payment_repo = payment_repo

    async def get_payment(self, payment_id: str, user: User) -> PaymentResponse:
        """
        Get payment by ID.

        Args:
            payment_id: Payment ID
            user: Current user

        Returns:
            Payment response

        Raises:
            NotFoundError: If payment not found
            PermissionDeniedError: If user not authorized
        """
        payment = await self.payment_repo.get_with_user(payment_id)
        if not payment:
            raise NotFoundError("Payment", payment_id)

        # Check authorization
        if not user.is_staff and payment.user_id != user.id:
            raise PermissionDeniedError("You can only view your own payments")

        response = PaymentResponse.model_validate(payment)
        response.user_name = payment.user.full_name if payment.user else ""
        return response

    async def list_payments(
        self,
        pagination: PaginationParams,
        user_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> PaymentListResponse:
        """
        List payments with filters.

        Args:
            pagination: Pagination parameters
            user_id: Filter by user
            status: Filter by status

        Returns:
            Paginated payment list
        """
        filters = {}

        if user_id:
            payments = await self.payment_repo.get_by_user(
                user_id,
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = len(payments)
        elif status:
            payments = await self.payment_repo.get_by_status(
                PaymentStatus(status),
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.payment_repo.count_by_status(PaymentStatus(status))
        else:
            payments = await self.payment_repo.get_all(
                skip=pagination.offset,
                limit=pagination.size,
            )
            total = await self.payment_repo.count()

        items = []
        for p in payments:
            item = PaymentBriefResponse.model_validate(p)
            item.user_name = p.user.full_name if hasattr(p, "user") and p.user else ""
            items.append(item)

        return PaymentListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def create_payment(self, request: PaymentCreateRequest) -> PaymentResponse:
        """
        Create a new payment.

        Args:
            request: Payment creation data

        Returns:
            Created payment
        """
        payment = Payment(
            user_id=request.user_id,
            enrollment_id=request.enrollment_id,
            amount=request.amount,
            method=request.method.value,
            status=PaymentStatus.PENDING.value,
            description=request.description,
            notes=request.notes,
            transaction_id=generate_uuid(),
        )

        await self.payment_repo.create(payment)

        # Reload with user
        payment = await self.payment_repo.get_with_user(payment.id)
        response = PaymentResponse.model_validate(payment)
        response.user_name = payment.user.full_name if payment.user else ""
        return response

    async def confirm_payment(
        self,
        payment_id: str,
        processed_by: str,
    ) -> PaymentResponse:
        """
        Confirm payment.

        Args:
            payment_id: Payment ID
            processed_by: User ID who processed the payment

        Returns:
            Confirmed payment

        Raises:
            NotFoundError: If payment not found
        """
        payment = await self.payment_repo.get_with_user(payment_id)
        if not payment:
            raise NotFoundError("Payment", payment_id)

        await self.payment_repo.update(
            payment,
            status=PaymentStatus.COMPLETED.value,
            paid_at=datetime.now(timezone.utc),
            processed_by=processed_by,
        )

        # Update enrollment paid amount if applicable
        if payment.enrollment_id:
            # TODO: Update enrollment.paid_amount
            pass

        response = PaymentResponse.model_validate(payment)
        response.user_name = payment.user.full_name if payment.user else ""
        return response

