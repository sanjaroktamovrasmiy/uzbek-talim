"""
Authentication service.
"""

from datetime import datetime, timezone

from shared import get_settings, AuthenticationError, ValidationError
from shared.utils import generate_code
from db.models import User

from src.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from src.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    VerifyPhoneRequest,
    VerifyPhoneResponse,
)
from src.repositories.user_repository import UserRepository


settings = get_settings()


class AuthService:
    """Authentication service."""

    def __init__(self, user_repo: UserRepository):
        """Initialize service."""
        self.user_repo = user_repo
        # In production, use Redis for verification codes
        self._verification_codes: dict[str, str] = {}

    async def register(self, request: RegisterRequest) -> RegisterResponse:
        """
        Register a new user.

        Args:
            request: Registration data

        Returns:
            Registration response

        Raises:
            ValidationError: If phone already registered
        """
        # Check if phone already exists
        existing = await self.user_repo.get_by_phone(request.phone)
        if existing:
            raise ValidationError("Phone number already registered")

        # Create user (unverified)
        user = User(
            phone=request.phone,
            first_name=request.first_name,
            last_name=request.last_name,
            password_hash=hash_password(request.password),
            is_verified=False,
        )
        await self.user_repo.create(user)

        # Generate and send verification code
        code = generate_code(6)
        self._verification_codes[request.phone] = code

        # TODO: Send SMS with code
        # await send_sms(request.phone, f"Your verification code: {code}")

        return RegisterResponse(
            message="Registration successful. Please verify your phone number.",
            phone=request.phone,
            verification_required=True,
        )

    async def verify_phone(self, request: VerifyPhoneRequest) -> VerifyPhoneResponse:
        """
        Verify phone number with code.

        Args:
            request: Verification data

        Returns:
            Verification response
        """
        # In development, accept any code
        if settings.debug:
            stored_code = request.code
        else:
            stored_code = self._verification_codes.get(request.phone)

        if not stored_code or stored_code != request.code:
            raise ValidationError("Invalid verification code")

        # Update user as verified
        user = await self.user_repo.get_by_phone(request.phone)
        if user:
            await self.user_repo.update(user, is_verified=True)

        # Remove used code
        self._verification_codes.pop(request.phone, None)

        return VerifyPhoneResponse(
            message="Phone verified successfully",
            verified=True,
        )

    async def login(self, phone: str, password: str) -> TokenResponse:
        """
        Login with phone and password.

        Args:
            phone: Phone number
            password: Password

        Returns:
            Token response

        Raises:
            AuthenticationError: If credentials invalid
        """
        from shared.utils import format_phone

        phone = format_phone(phone)
        user = await self.user_repo.get_by_phone(phone)

        if not user:
            raise AuthenticationError("Invalid phone number or password")

        if not user.password_hash:
            raise AuthenticationError("Password not set. Please reset your password.")

        if not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid phone number or password")

        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        return self._create_tokens(user)

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        """
        Refresh access token.

        Args:
            refresh_token: Refresh token

        Returns:
            New token response

        Raises:
            AuthenticationError: If token invalid
        """
        try:
            payload = decode_refresh_token(refresh_token)
            user_id = payload.get("sub")
        except Exception:
            raise AuthenticationError("Invalid refresh token")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User not found or inactive")

        return self._create_tokens(user)

    async def logout(self, user_id: str) -> None:
        """
        Logout user.

        In production, invalidate tokens in Redis.

        Args:
            user_id: User ID
        """
        # TODO: Add token to blacklist in Redis
        pass

    def _create_tokens(self, user: User) -> TokenResponse:
        """Create access and refresh tokens."""
        token_data = {"sub": user.id, "role": user.role}

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.jwt_access_token_expire_minutes * 60,
        )

