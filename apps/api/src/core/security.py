"""
Security utilities.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

from shared import get_settings, AuthenticationError


settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create JWT access token.

    Args:
        data: Token payload
        expires_delta: Token expiration time

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create JWT refresh token.

    Args:
        data: Token payload
        expires_delta: Token expiration time

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        or timedelta(days=settings.jwt_refresh_token_expire_days)
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate access token.

    Args:
        token: JWT token to decode

    Returns:
        Token payload

    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type")
        return payload
    except JWTError as e:
        raise AuthenticationError(f"Token validation failed: {e}")


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate refresh token.

    Args:
        token: JWT token to decode

    Returns:
        Token payload

    Raises:
        AuthenticationError: If token is invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid token type")
        return payload
    except JWTError as e:
        raise AuthenticationError(f"Token validation failed: {e}")

