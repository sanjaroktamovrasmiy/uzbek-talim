"""
Authentication service.
"""

from datetime import datetime, timezone, timedelta

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
from src.services.telegram_service import get_telegram_service


settings = get_settings()

_VERIFICATION_CODE_TTL_SECONDS = 5 * 60  # 5 minutes
_verification_codes: dict[str, tuple[str, datetime]] = {}


def _set_verification_code(phone: str, code: str) -> None:
    """Store verification code with TTL (in-memory, per-process)."""
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=_VERIFICATION_CODE_TTL_SECONDS)
    _verification_codes[phone] = (code, expires_at)


def _get_verification_code(phone: str) -> str | None:
    """Get verification code if exists and not expired."""
    data = _verification_codes.get(phone)
    if not data:
        return None
    stored_code, expires_at = data
    if expires_at < datetime.now(timezone.utc):
        _verification_codes.pop(phone, None)
        return None
    return stored_code


def _clear_verification_code(phone: str) -> None:
    """Delete verification code."""
    _verification_codes.pop(phone, None)


class AuthService:
    """Authentication service."""

    def __init__(self, user_repo: UserRepository):
        """Initialize service."""
        self.user_repo = user_repo
        self.telegram_service = get_telegram_service()

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
            raise ValidationError(
                "Bu telefon raqam orqali allaqachon ro'yxatdan o'tgan foydalanuvchi mavjud. "
                "Agar bu sizning raqamingiz bo'lsa, iltimos kirish sahifasiga o'ting va parolingiz bilan kiring. "
                "Agar parolingizni unutgan bo'lsangiz, parolni tiklash funksiyasidan foydalaning. "
                "Agar bu raqamdan boshqa hisob ochmoqchi bo'lsangiz, avval eski hisobni o'chirishingiz kerak. "
                "Hisobni o'chirish uchun profil sahifasiga kiring va 'Hisobni o'chirish' tugmasini bosing."
            )

        # Create user (unverified)
        user = User(
            phone=request.phone,
            first_name=request.first_name,
            last_name=request.last_name,
            password_hash=hash_password(request.password),
            role=request.role.value,
            is_verified=False,
        )
        await self.user_repo.create(user)

        # Generate and send verification code
        code = generate_code(6)
        _set_verification_code(request.phone, code)

        # Try to send code via Telegram if user has telegram_id
        # (User might register via web but have telegram_id from bot)
        # IMPORTANT: Telegram auth orqali tekshirish - agar telegram_id bo'lsa, kod Telegram orqali yuboriladi
        if user.telegram_id:
            try:
                await self.telegram_service.send_verification_code(
                    telegram_id=user.telegram_id,
                    code=code,
                    phone=request.phone,
                    is_login=False,
                )
            except Exception:
                # Telegram yuborish xatolik bo'lsa ham, kod saqlanadi (fallback SMS yoki boshqa usul)
                pass

        # TODO: Send SMS with code as fallback
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
        # Always verify code (no debug mode bypass)
        stored_code = _get_verification_code(request.phone)

        if not stored_code or stored_code != request.code:
            raise ValidationError("Noto'g'ri tasdiqlash kodi. Iltimos, qaytadan urinib ko'ring.")

        # Update user as verified
        user = await self.user_repo.get_by_phone(request.phone)
        if user:
            await self.user_repo.update(user, is_verified=True)

        # Remove used code
        _clear_verification_code(request.phone)

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

        if not user.is_verified:
            raise AuthenticationError(
                "Telefon raqami tasdiqlanmagan. Iltimos, ro'yxatdan o'tish jarayonida tasdiqlash kodini kiriting."
            )

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

    async def send_telegram_code(self, phone: str, is_login: bool = False) -> dict:
        """
        Send verification code via Telegram.

        Args:
            phone: Phone number
            is_login: True if login, False if registration

        Returns:
            Dict with success status and message

        Raises:
            ValidationError: If user not found or no telegram_id
        """
        from shared.utils import format_phone

        phone = format_phone(phone)
        user = await self.user_repo.get_by_phone(phone)

        if not user:
            raise ValidationError("User not found. Please register first.")

        if not user.telegram_id:
            raise ValidationError(
                "Telegram ID topilmadi. Telegram orqali kod yuborish uchun avval Telegram botga /start buyrug'ini yuborib, "
                "bot bilan bog'lanishingiz kerak. Botga /start bosmagan bo'lsangiz, telefon raqam orqali tasdiqlash kodini qo'lda kiriting."
            )

        # Generate verification code
        code = generate_code(6)
        _set_verification_code(phone, code)

        # Send via Telegram
        sent = await self.telegram_service.send_verification_code(
            telegram_id=user.telegram_id,
            code=code,
            phone=phone,
            is_login=is_login,
        )

        if not sent:
            raise ValidationError("Failed to send code via Telegram. Please try again.")

        return {
            "success": True,
            "message": "Verification code sent to your Telegram account",
            "phone": phone,
        }

    async def verify_telegram_code(
        self, phone: str, code: str, return_tokens: bool = False
    ) -> dict:
        """
        Verify code sent via Telegram.

        Args:
            phone: Phone number
            code: Verification code
            return_tokens: If True, return JWT tokens after verification

        Returns:
            Dict with verification result and optionally tokens

        Raises:
            ValidationError: If code invalid
        """
        from shared.utils import format_phone

        phone = format_phone(phone)

        # Check code
        stored_code = _get_verification_code(phone)
        if not stored_code or stored_code != code:
            raise ValidationError("Invalid verification code")

        # Remove used code
        _clear_verification_code(phone)

        # Update user as verified
        user = await self.user_repo.get_by_phone(phone)
        if not user:
            raise ValidationError("User not found")

        await self.user_repo.update(user, is_verified=True)

        result = {
            "success": True,
            "message": "Phone verified successfully",
            "verified": True,
        }

        # Return tokens if requested
        if return_tokens:
            tokens = self._create_tokens(user)
            result["access_token"] = tokens.access_token
            result["refresh_token"] = tokens.refresh_token
            result["expires_in"] = tokens.expires_in

        return result

    async def logout(self, user_id: str) -> None:
        """
        Logout user.

        In production, invalidate tokens in Redis.

        Args:
            user_id: User ID
        """
        # TODO: Add token to blacklist in Redis
        pass

    async def change_password(
        self, user_id: str, current_password: str, new_password: str
    ) -> dict:
        """
        Change user password.

        Args:
            user_id: User ID
            current_password: Current password
            new_password: New password

        Returns:
            Dict with success status

        Raises:
            AuthenticationError: If current password invalid
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AuthenticationError("User not found")

        if not user.password_hash:
            raise AuthenticationError("Password not set. Please set password first.")

        if not verify_password(current_password, user.password_hash):
            raise AuthenticationError("Current password is incorrect")

        # Update password
        await self.user_repo.update(user, password_hash=hash_password(new_password))

        return {
            "success": True,
            "message": "Password changed successfully",
        }

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

