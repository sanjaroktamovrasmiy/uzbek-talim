"""
Test schemas.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from decimal import Decimal

from pydantic import BaseModel, Field

from src.schemas.common import PaginatedResponse
from shared.constants import TestType, ScoringModel


class TestQuestionOptionCreateRequest(BaseModel):
    """Test question option creation request."""

    option_text: str = Field(..., min_length=1)
    is_correct: bool = False
    order_index: int = 0


class TestQuestionOptionResponse(BaseModel):
    """Test question option response."""

    id: str
    option_text: str
    is_correct: bool
    order_index: int

    class Config:
        from_attributes = True


class TestQuestionCreateRequest(BaseModel):
    """Test question creation request."""

    question_text: str = Field(..., min_length=1)
    question_type: str = Field(default="single_choice")  # single_choice, multiple_choice, text
    order_index: int = 0
    points: int = Field(default=1, ge=1)
    options: List[TestQuestionOptionCreateRequest] = []


class TestQuestionResponse(BaseModel):
    """Test question response."""

    id: str
    question_text: str
    question_type: str
    order_index: int
    points: int
    options: List[TestQuestionOptionResponse] = []

    class Config:
        from_attributes = True


class TestBase(BaseModel):
    """Base test schema."""

    course_id: Optional[str] = None
    test_type: str = Field(default=TestType.COURSE_TEST.value)
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    duration: int = Field(30, ge=1, le=300)  # minutes
    max_score: int = Field(100, ge=1)
    passing_score: int = Field(60, ge=0)
    is_active: bool = True
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    access_key: Optional[str] = Field(None, min_length=4, max_length=100)
    scoring_model: str = Field(default=ScoringModel.SIMPLE.value)
    test_config: Dict[str, Any] = Field(default_factory=dict)


class TestCreateRequest(TestBase):
    """Test creation request."""

    questions: List[TestQuestionCreateRequest] = []


class TestUpdateRequest(BaseModel):
    """Test update request."""

    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    duration: Optional[int] = Field(None, ge=1, le=300)
    max_score: Optional[int] = Field(None, ge=1)
    passing_score: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    test_type: Optional[str] = None
    access_key: Optional[str] = Field(None, min_length=4, max_length=100)
    scoring_model: Optional[str] = None
    test_config: Optional[Dict[str, Any]] = None


class TestResponse(BaseModel):
    """Test response."""

    id: str
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    test_type: str
    title: str
    description: Optional[str] = None
    duration: int
    max_score: int
    passing_score: int
    is_active: bool
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    access_key: Optional[str] = None
    scoring_model: str
    test_config: Dict[str, Any] = Field(default_factory=dict)
    questions: List[TestQuestionResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestBriefResponse(BaseModel):
    """Brief test response."""

    id: str
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    test_type: str
    title: str
    duration: int
    max_score: int
    passing_score: int
    is_active: bool
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    scoring_model: str

    class Config:
        from_attributes = True


class TestListResponse(PaginatedResponse[TestBriefResponse]):
    """Paginated test list response."""

    pass

