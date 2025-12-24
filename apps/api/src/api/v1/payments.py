"""
Payment endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from src.schemas.payment import (
    PaymentResponse,
    PaymentListResponse,
    PaymentCreateRequest,
)
from src.schemas.common import PaginationParams
from src.services.payment_service import PaymentService
from src.core.deps import get_payment_service, get_current_user, require_staff
from db.models import User


router = APIRouter()


@router.get("", response_model=PaymentListResponse)
async def list_payments(
    payment_service: Annotated[PaymentService, Depends(get_payment_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = None,
    status: Optional[str] = None,
) -> PaymentListResponse:
    """
    List payments.
    """
    pagination = PaginationParams(page=page, size=size)

    # Non-staff can only see their own payments
    if not current_user.is_staff:
        user_id = current_user.id

    return await payment_service.list_payments(
        pagination=pagination,
        user_id=user_id,
        status=status,
    )


@router.post("", response_model=PaymentResponse)
async def create_payment(
    request: PaymentCreateRequest,
    payment_service: Annotated[PaymentService, Depends(get_payment_service)],
    _: Annotated[User, Depends(require_staff)],
) -> PaymentResponse:
    """
    Create a new payment (staff only).
    """
    return await payment_service.create_payment(request)


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: str,
    payment_service: Annotated[PaymentService, Depends(get_payment_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> PaymentResponse:
    """
    Get payment by ID.
    """
    return await payment_service.get_payment(payment_id, current_user)


@router.post("/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    payment_service: Annotated[PaymentService, Depends(get_payment_service)],
    staff: Annotated[User, Depends(require_staff)],
) -> PaymentResponse:
    """
    Confirm payment (staff only).
    """
    return await payment_service.confirm_payment(payment_id, staff.id)

