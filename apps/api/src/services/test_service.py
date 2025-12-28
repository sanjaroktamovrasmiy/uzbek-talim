"""
Test service.
"""

from typing import Optional
from datetime import datetime, timezone
import secrets
import string

from sqlalchemy import select, func, or_

from shared import NotFoundError, ValidationError
from db.models import Test, TestQuestion, TestQuestionOption, User, TestResult
from shared.constants import UserRole, TestType

from src.schemas.test import (
    TestCreateRequest,
    TestUpdateRequest,
    TestResponse,
    TestListResponse,
    TestBriefResponse,
    TestQuestionCreateRequest,
)
from src.schemas.common import PaginationParams
from src.repositories.test_repository import (
    TestRepository,
    TestQuestionRepository,
    TestQuestionOptionRepository,
)
from src.repositories.course_repository import CourseRepository


class TestService:
    """Test service."""

    def __init__(
        self,
        test_repo: TestRepository,
        question_repo: TestQuestionRepository,
        option_repo: TestQuestionOptionRepository,
        course_repo: CourseRepository,
    ):
        """Initialize service."""
        self.test_repo = test_repo
        self.question_repo = question_repo
        self.option_repo = option_repo
        self.course_repo = course_repo

    def _generate_access_key(self) -> str:
        """Generate a unique access key for test."""
        chars = string.ascii_uppercase + string.digits
        return "".join(secrets.choice(chars) for _ in range(8))

    async def list_tests(
        self,
        user: User,
        pagination: PaginationParams,
        course_id: Optional[str] = None,
        test_type: Optional[str] = None,
    ) -> TestListResponse:
        """
        List tests.

        Students see only active tests for their enrolled courses and public tests.
        Teachers see all tests for their courses.
        """
        skip = (pagination.page - 1) * pagination.size

        if user.role == UserRole.STUDENT.value:
            # Students see only active tests
            query = select(Test).where(
                Test.is_active == True,
                Test.deleted_at.is_(None),
            )
            # Students can see course tests and public tests
            if course_id:
                query = query.where(Test.course_id == course_id)
            else:
                # Show course tests and public tests
                query = query.where(
                    or_(
                        Test.test_type == TestType.PUBLIC_TEST.value,
                        Test.course_id.isnot(None),
                    )
                )
        else:
            # Teachers and admins see all tests
            query = select(Test).where(Test.deleted_at.is_(None))
            if course_id:
                query = query.where(Test.course_id == course_id)

        # Filter by test type if provided
        if test_type:
            query = query.where(Test.test_type == test_type)

        # Get total count
        count_query = select(func.count(Test.id)).where(Test.deleted_at.is_(None))
        if course_id:
            count_query = count_query.where(Test.course_id == course_id)
        if test_type:
            count_query = count_query.where(Test.test_type == test_type)
        
        total_result = await self.test_repo.session.execute(count_query)
        total = total_result.scalar() or 0

        # Get paginated results
        query = query.offset(skip).limit(pagination.size).order_by(Test.created_at.desc())
        result = await self.test_repo.session.execute(query)
        tests = list(result.scalars().all())

        # Load course names
        for test in tests:
            if test.course_id:
                course = await self.course_repo.get_by_id(test.course_id)
                if course:
                    test.course_name = course.name

        items = [TestBriefResponse.model_validate(test) for test in tests]

        return TestListResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size,
        )

    async def get_test(
        self, test_id: str, user: User, access_key: Optional[str] = None
    ) -> TestResponse:
        """
        Get test by ID.

        Students can only see active tests.
        Teachers can see all tests.
        If test has access_key, it must match.
        """
        test = await self.test_repo.get_with_questions(test_id)
        if not test:
            raise NotFoundError("Test", test_id)

        # Check access key if test requires it
        if test.access_key:
            if not access_key or test.access_key != access_key:
                raise ValidationError("Invalid access key for test")

        # Students can only see active tests
        if user.role == UserRole.STUDENT.value and not test.is_active:
            raise NotFoundError("Test", test_id)

        # Load course name
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name

        return TestResponse.model_validate(test)

    async def create_test(
        self, request: TestCreateRequest, created_by: str
    ) -> TestResponse:
        """
        Create a new test.
        """
        # Verify course exists if course_id is provided
        if request.course_id:
            course = await self.course_repo.get_by_id(request.course_id)
            if not course:
                raise NotFoundError("Course", request.course_id)
        elif request.test_type == TestType.COURSE_TEST.value:
            raise ValidationError("course_id is required for course_test type")

        # Generate access key if test_type requires it but not provided
        access_key = request.access_key
        if request.test_type in [
            TestType.SAT_MOCK.value,
            TestType.ENTRANCE_TEST.value,
            TestType.MOCK_TEST.value,
        ] and not access_key:
            # Generate unique access key
            access_key = self._generate_access_key()
            # Ensure uniqueness (simple check, in production might need retry logic)
            existing = await self.test_repo.session.execute(
                select(Test).where(Test.access_key == access_key)
            )
            if existing.scalar_one_or_none():
                access_key = self._generate_access_key()

        # Create test
        test = Test(
            course_id=request.course_id,
            test_type=request.test_type,
            title=request.title,
            description=request.description,
            duration=request.duration,
            max_score=request.max_score,
            passing_score=request.passing_score,
            is_active=request.is_active,
            available_from=request.available_from,
            available_until=request.available_until,
            access_key=access_key,
            scoring_model=request.scoring_model,
            test_config=request.test_config or {},
        )

        await self.test_repo.create(test)

        # Create questions
        for q_data in request.questions:
            question = TestQuestion(
                test_id=test.id,
                question_text=q_data.question_text,
                question_type=q_data.question_type,
                order_index=q_data.order_index,
                points=q_data.points,
            )
            await self.question_repo.create(question)

            # Create options
            for o_data in q_data.options:
                option = TestQuestionOption(
                    question_id=question.id,
                    option_text=o_data.option_text,
                    is_correct=o_data.is_correct,
                    order_index=o_data.order_index,
                )
                await self.option_repo.create(option)

        # Reload with relations
        test = await self.test_repo.get_with_questions(test.id)
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name

        return TestResponse.model_validate(test)

    async def update_test(
        self, test_id: str, request: TestUpdateRequest, updated_by: str
    ) -> TestResponse:
        """
        Update test.
        """
        test = await self.test_repo.get_by_id(test_id)
        if not test:
            raise NotFoundError("Test", test_id)

        update_data = request.model_dump(exclude_unset=True)
        await self.test_repo.update(test, **update_data)

        # Reload with relations
        test = await self.test_repo.get_with_questions(test_id)
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name

        return TestResponse.model_validate(test)

    async def delete_test(self, test_id: str, deleted_by: str) -> None:
        """
        Delete test (soft delete).
        """
        test = await self.test_repo.get_by_id(test_id)
        if not test:
            raise NotFoundError("Test", test_id)

        await self.test_repo.soft_delete(test)

    async def add_question(
        self, test_id: str, request: TestQuestionCreateRequest, created_by: str
    ) -> TestResponse:
        """
        Add question to test.
        """
        test = await self.test_repo.get_by_id(test_id)
        if not test:
            raise NotFoundError("Test", test_id)

        question = TestQuestion(
            test_id=test_id,
            question_text=request.question_text,
            question_type=request.question_type,
            order_index=request.order_index,
            points=request.points,
        )
        await self.question_repo.create(question)

        # Create options
        for o_data in request.options:
            option = TestQuestionOption(
                question_id=question.id,
                option_text=o_data.option_text,
                is_correct=o_data.is_correct,
                order_index=o_data.order_index,
            )
            await self.option_repo.create(option)

        # Reload with relations
        test = await self.test_repo.get_with_questions(test_id)
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name

        return TestResponse.model_validate(test)

    async def start_test(self, test_id: str, user: User) -> TestResponse:
        """
        Start a test for a user.
        
        Creates a TestResult record with started_at timestamp.
        
        Args:
            test_id: Test ID
            user: Current user
            
        Returns:
            Test response with questions (without correct answers)
            
        Raises:
            NotFoundError: If test not found
            ValidationError: If test already started or not available
        """
        test = await self.test_repo.get_with_questions(test_id)
        if not test:
            raise NotFoundError("Test", test_id)
        
        # Check if test is active (for students)
        if user.role == UserRole.STUDENT.value and not test.is_active:
            raise NotFoundError("Test", test_id)
        
        # Check if test result already exists (test already started)
        existing_result = await self.test_repo.session.execute(
            select(TestResult).where(
                TestResult.test_id == test_id,
                TestResult.user_id == user.id,
                TestResult.completed_at.is_(None),
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            # Test already started, return the test
            if test.course_id:
                course = await self.course_repo.get_by_id(test.course_id)
                if course:
                    test.course_name = course.name
            return TestResponse.model_validate(test)
        
        # Create TestResult record
        test_result = TestResult(
            test_id=test_id,
            user_id=user.id,
            started_at=datetime.now(timezone.utc),
            max_score=test.max_score,
            answers={},
        )
        self.test_repo.session.add(test_result)
        await self.test_repo.session.flush()
        
        # Load course name
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name
        
        return TestResponse.model_validate(test)
    
    async def submit_test(
        self,
        test_id: str,
        user: User,
        answers: dict[str, list[str]],
    ) -> dict:
        """
        Submit test answers.
        
        Calculates score and marks test as completed.
        
        Args:
            test_id: Test ID
            user: Current user
            answers: Dictionary mapping question_id to list of option_ids or text answers
            
        Returns:
            Test result with score and percentage
            
        Raises:
            NotFoundError: If test or test result not found
        """
        test = await self.test_repo.get_with_questions(test_id)
        if not test:
            raise NotFoundError("Test", test_id)
        
        # Get or create test result
        result = await self.test_repo.session.execute(
            select(TestResult).where(
                TestResult.test_id == test_id,
                TestResult.user_id == user.id,
            )
            .order_by(TestResult.created_at.desc())
        )
        test_result = result.scalar_one_or_none()
        
        if not test_result:
            # Create new test result if not exists
            test_result = TestResult(
                test_id=test_id,
                user_id=user.id,
                started_at=datetime.now(timezone.utc),
                max_score=test.max_score,
                answers=answers,
            )
            self.test_repo.session.add(test_result)
            await self.test_repo.session.flush()
        else:
            # Update existing test result
            test_result.answers = answers
            await self.test_repo.session.flush()
        
        # Calculate score
        score = 0.0
        total_points = 0.0
        
        for question in test.questions:
            total_points += question.points
            user_answer = answers.get(question.id, [])
            
            if question.question_type == "multiple_choice":
                # Get correct option IDs
                correct_options = [
                    opt.id for opt in question.options if opt.is_correct
                ]
                # Check if all correct options are selected and no incorrect ones
                if set(user_answer) == set(correct_options) and len(user_answer) == len(correct_options):
                    score += question.points
            elif question.question_type == "single_choice":
                # Get correct option ID
                correct_option = next(
                    (opt.id for opt in question.options if opt.is_correct),
                    None,
                )
                if user_answer and user_answer[0] == correct_option:
                    score += question.points
            elif question.question_type == "text":
                # For text questions, assume they need manual grading (score = 0 for now)
                # Can be updated later by teacher
                pass
        
        # Update test result
        test_result.score = score
        test_result.percentage = (score / total_points * 100) if total_points > 0 else 0.0
        test_result.is_passed = test_result.percentage >= test.passing_score
        test_result.completed_at = datetime.now(timezone.utc)
        await self.test_repo.session.flush()
        
        return {
            "test_id": test_id,
            "score": score,
            "max_score": test.max_score,
            "percentage": test_result.percentage,
            "is_passed": test_result.is_passed,
            "completed_at": test_result.completed_at.isoformat(),
        }

