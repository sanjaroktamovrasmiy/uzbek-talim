"""
Payment schemas.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from shared.constants import PaymentMethod, PaymentStatus
from src.schemas.common import PaginatedResponse


class PaymentCreateRequest(BaseModel):
    """Payment creation request."""

    user_id: str
    enrollment_id: Optional[str] = None
    amount: Decimal = Field(..., gt=0)
    method: PaymentMethod = PaymentMethod.CASH
    description: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    """Payment response."""

    id: str
    user_id: str
    user_name: str = ""
    enrollment_id: Optional[str] = None
    amount: Decimal
    currency: str
    method: str
    status: str
    transaction_id: Optional[str] = None
    paid_at: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaymentBriefResponse(BaseModel):
    """Brief payment response for lists."""

    id: str
    user_name: str = ""
    amount: Decimal
    currency: str
    method: str
    status: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaymentListResponse(PaginatedResponse[PaymentBriefResponse]):
    """Paginated payment list response."""

    pass

