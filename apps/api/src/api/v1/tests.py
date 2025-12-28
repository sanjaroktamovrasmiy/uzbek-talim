"""
Test management endpoints.
"""

from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, Body

from src.schemas.test import (
    TestResponse,
    TestListResponse,
    TestCreateRequest,
    TestUpdateRequest,
    TestQuestionCreateRequest,
)
from src.schemas.common import PaginationParams
from src.services.test_service import TestService
from src.core.deps import get_test_service, get_current_user, require_teacher
from db.models import User


router = APIRouter()


@router.get("", response_model=TestListResponse)
async def list_tests(
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    course_id: Optional[str] = None,
    test_type: Optional[str] = None,
) -> TestListResponse:
    """
    List tests.
    Students see only active tests for their enrolled courses and public tests.
    Teachers see all tests for their courses.
    """
    pagination = PaginationParams(page=page, size=size)
    return await test_service.list_tests(
        user=current_user,
        pagination=pagination,
        course_id=course_id,
        test_type=test_type,
    )


@router.post("", response_model=TestResponse)
async def create_test(
    request: TestCreateRequest,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> TestResponse:
    """
    Create a new test (teacher and admin only).
    """
    return await test_service.create_test(request, created_by=current_user.id)


@router.get("/{test_id}", response_model=TestResponse)
async def get_test(
    test_id: str,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(get_current_user)],
    access_key: Optional[str] = Query(None, description="Access key for private tests"),
) -> TestResponse:
    """
    Get test by ID.
    If test requires access_key, it must be provided as query parameter.
    """
    return await test_service.get_test(test_id, current_user, access_key=access_key)


@router.patch("/{test_id}", response_model=TestResponse)
async def update_test(
    test_id: str,
    request: TestUpdateRequest,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> TestResponse:
    """
    Update test (teacher and admin only).
    """
    return await test_service.update_test(test_id, request, current_user.id)


@router.delete("/{test_id}")
async def delete_test(
    test_id: str,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> dict:
    """
    Delete test (teacher and admin only).
    """
    await test_service.delete_test(test_id, current_user.id)
    return {"message": "Test deleted successfully"}


@router.post("/{test_id}/questions", response_model=TestResponse)
async def add_question(
    test_id: str,
    request: TestQuestionCreateRequest,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(require_teacher)],
) -> TestResponse:
    """
    Add question to test (teacher and admin only).
    """
    return await test_service.add_question(test_id, request, current_user.id)


@router.post("/{test_id}/start", response_model=TestResponse)
async def start_test(
    test_id: str,
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> TestResponse:
    """
    Start a test.
    Creates a test attempt record.
    """
    return await test_service.start_test(test_id, current_user)


@router.post("/{test_id}/submit")
async def submit_test(
    test_id: str,
    answers: Annotated[dict[str, list[str]], Body()],
    test_service: Annotated[TestService, Depends(get_test_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Submit test answers.
    Calculates score and marks test as completed.
    """
    return await test_service.submit_test(test_id, current_user, answers)

