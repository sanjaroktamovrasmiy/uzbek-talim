"""
API Routes.
"""

from fastapi import APIRouter

from src.api.v1 import auth, users, courses, groups, lessons, payments, notifications

router = APIRouter()

# Include all routers
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(courses.router, prefix="/courses", tags=["Courses"])
router.include_router(groups.router, prefix="/groups", tags=["Groups"])
router.include_router(lessons.router, prefix="/lessons", tags=["Lessons"])
router.include_router(payments.router, prefix="/payments", tags=["Payments"])
router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

