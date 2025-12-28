"""
FastAPI Dependencies.
"""

from typing import Annotated, AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from shared import get_settings, AuthenticationError, PermissionDeniedError
from db.session import AsyncSessionLocal
from db.models import User

from src.core.security import decode_access_token
from src.services.auth_service import AuthService
from src.services.user_service import UserService
from src.services.course_service import CourseService
from src.services.group_service import GroupService
from src.services.lesson_service import LessonService
from src.services.payment_service import PaymentService
from src.services.notification_service import NotificationService
from src.services.test_service import TestService
from src.repositories.user_repository import UserRepository
from src.repositories.course_repository import CourseRepository
from src.repositories.group_repository import GroupRepository
from src.repositories.lesson_repository import LessonRepository
from src.repositories.payment_repository import PaymentRepository
from src.repositories.notification_repository import NotificationRepository
from src.repositories.test_repository import (
    TestRepository,
    TestQuestionRepository,
    TestQuestionOptionRepository,
)


settings = get_settings()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_prefix}/auth/login",
    auto_error=False,
)


# ===========================================
# Database Session
# ===========================================


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ===========================================
# Repositories
# ===========================================


def get_user_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserRepository:
    """Get user repository."""
    return UserRepository(db)


def get_course_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CourseRepository:
    """Get course repository."""
    return CourseRepository(db)


def get_group_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> GroupRepository:
    """Get group repository."""
    return GroupRepository(db)


def get_lesson_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> LessonRepository:
    """Get lesson repository."""
    return LessonRepository(db)


def get_payment_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PaymentRepository:
    """Get payment repository."""
    return PaymentRepository(db)


def get_notification_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> NotificationRepository:
    """Get notification repository."""
    return NotificationRepository(db)


def get_test_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TestRepository:
    """Get test repository."""
    return TestRepository(db)


def get_test_question_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TestQuestionRepository:
    """Get test question repository."""
    return TestQuestionRepository(db)


def get_test_question_option_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TestQuestionOptionRepository:
    """Get test question option repository."""
    return TestQuestionOptionRepository(db)


# ===========================================
# Services
# ===========================================


def get_auth_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> AuthService:
    """Get auth service."""
    return AuthService(user_repo)


def get_user_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> UserService:
    """Get user service."""
    return UserService(user_repo)


def get_course_service(
    course_repo: Annotated[CourseRepository, Depends(get_course_repository)],
) -> CourseService:
    """Get course service."""
    return CourseService(course_repo)


def get_group_service(
    group_repo: Annotated[GroupRepository, Depends(get_group_repository)],
) -> GroupService:
    """Get group service."""
    return GroupService(group_repo)


def get_lesson_service(
    lesson_repo: Annotated[LessonRepository, Depends(get_lesson_repository)],
) -> LessonService:
    """Get lesson service."""
    return LessonService(lesson_repo)


def get_payment_service(
    payment_repo: Annotated[PaymentRepository, Depends(get_payment_repository)],
) -> PaymentService:
    """Get payment service."""
    return PaymentService(payment_repo)


def get_notification_service(
    notification_repo: Annotated[NotificationRepository, Depends(get_notification_repository)],
) -> NotificationService:
    """Get notification service."""
    return NotificationService(notification_repo)


def get_test_service(
    test_repo: Annotated[TestRepository, Depends(get_test_repository)],
    question_repo: Annotated[TestQuestionRepository, Depends(get_test_question_repository)],
    option_repo: Annotated[TestQuestionOptionRepository, Depends(get_test_question_option_repository)],
    course_repo: Annotated[CourseRepository, Depends(get_course_repository)],
) -> TestService:
    """Get test service."""
    return TestService(test_repo, question_repo, option_repo, course_repo)


# ===========================================
# Authentication
# ===========================================


async def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> User:
    """Get current authenticated user."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active",
        )

    return user


async def get_optional_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    user_repo: Annotated[UserRepository, Depends(get_user_repository)],
) -> User | None:
    """Get current user if authenticated, else None."""
    if not token:
        return None

    try:
        return await get_current_user(token, user_repo)
    except HTTPException:
        return None


# ===========================================
# Authorization
# ===========================================


async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require admin role."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


async def require_staff(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require staff role."""
    if not current_user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access required",
        )
    return current_user


async def require_teacher(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require teacher role (teacher, admin, or super_admin)."""
    from shared.constants import UserRole
    
    # Allow teacher, admin, and super_admin
    # Use is_staff property which includes teacher, admin, and super_admin
    # But exclude manager (if needed, we can add it later)
    allowed_roles = [
        UserRole.TEACHER.value,
        UserRole.ADMIN.value,
        UserRole.SUPER_ADMIN.value,
    ]
    
    user_role = current_user.role
    
    # Check if user is staff (includes teacher, admin, super_admin, manager)
    # But we only want teacher, admin, super_admin
    if user_role in allowed_roles:
        return current_user
    
    # Fallback: check is_admin property
    if current_user.is_admin:
        return current_user
    
    # If none of the above, deny access
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=f"Teacher or admin access required. Current role: {user_role}",
    )

