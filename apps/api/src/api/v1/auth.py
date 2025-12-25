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
    SendTelegramCodeRequest,
    SendTelegramCodeResponse,
    VerifyTelegramCodeRequest,
    VerifyTelegramCodeResponse,
    ChangePasswordRequest,
    ChangePasswordResponse,
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


@router.post("/send-telegram-code", response_model=SendTelegramCodeResponse)
async def send_telegram_code(
    request: SendTelegramCodeRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> SendTelegramCodeResponse:
    """
    Send verification code via Telegram bot.

    User must have telegram_id in database (connected via bot first).
    """
    result = await auth_service.send_telegram_code(
        phone=request.phone,
        is_login=False,  # Can be used for both login and registration
    )
    return SendTelegramCodeResponse(**result)


@router.post("/send-telegram-code-login", response_model=SendTelegramCodeResponse)
async def send_telegram_code_login(
    request: SendTelegramCodeRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> SendTelegramCodeResponse:
    """
    Send verification code via Telegram bot for login.
    """
    result = await auth_service.send_telegram_code(
        phone=request.phone,
        is_login=True,
    )
    return SendTelegramCodeResponse(**result)


@router.post("/verify-telegram-code", response_model=VerifyTelegramCodeResponse)
async def verify_telegram_code(
    request: VerifyTelegramCodeRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> VerifyTelegramCodeResponse:
    """
    Verify code sent via Telegram and optionally return JWT tokens.
    """
    result = await auth_service.verify_telegram_code(
        phone=request.phone,
        code=request.code,
        return_tokens=request.return_tokens,
    )
    return VerifyTelegramCodeResponse(**result)


@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    request: ChangePasswordRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ChangePasswordResponse:
    """
    Change user password.
    """
    result = await auth_service.change_password(
        user_id=current_user.id,
        current_password=request.current_password,
        new_password=request.new_password,
    )
    return ChangePasswordResponse(**result)

