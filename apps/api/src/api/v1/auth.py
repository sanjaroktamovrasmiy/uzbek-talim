"""
Authentication endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from src.schemas.auth import (
    TokenResponse,
    RegisterRequest,
    RegisterResponse,
    RefreshTokenRequest,
    VerifyPhoneRequest,
    VerifyPhoneResponse,
)
from src.schemas.user import UserResponse
from src.services.auth_service import AuthService
from src.core.deps import get_auth_service, get_current_user
from db.models import User


router = APIRouter()


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> RegisterResponse:
    """
    Register a new user.

    Sends verification code to phone number.
    """
    return await auth_service.register(request)


@router.post("/verify", response_model=VerifyPhoneResponse)
async def verify_phone(
    request: VerifyPhoneRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> VerifyPhoneResponse:
    """
    Verify phone number with code.
    """
    return await auth_service.verify_phone(request)


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponse:
    """
    Login with phone and password.
    """
    return await auth_service.login(
        phone=form_data.username,
        password=form_data.password,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponse:
    """
    Refresh access token.
    """
    return await auth_service.refresh_token(request.refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """
    Get current authenticated user info.
    """
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> dict:
    """
    Logout current user.
    """
    await auth_service.logout(current_user.id)
    return {"message": "Successfully logged out"}

