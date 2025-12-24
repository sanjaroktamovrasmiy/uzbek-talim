"""
Application configuration using Pydantic Settings.

Centralized configuration management for all services.
"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ===========================================
    # Application
    # ===========================================
    app_name: str = Field(default="uzbek-talim", description="Application name")
    app_env: str = Field(default="development", description="Environment")
    debug: bool = Field(default=False, description="Debug mode")
    secret_key: str = Field(..., description="Application secret key")

    # ===========================================
    # Database
    # ===========================================
    database_url: str = Field(..., description="PostgreSQL async connection URL")
    database_sync_url: str = Field(
        default="", description="PostgreSQL sync connection URL"
    )
    db_pool_size: int = Field(default=20, description="Database pool size")
    db_max_overflow: int = Field(default=10, description="Database max overflow")
    db_pool_timeout: int = Field(default=30, description="Database pool timeout")

    # ===========================================
    # Redis
    # ===========================================
    redis_url: str = Field(
        default="redis://localhost:6379/0", description="Redis connection URL"
    )
    redis_cache_url: str = Field(
        default="redis://localhost:6379/1", description="Redis cache URL"
    )

    # ===========================================
    # API
    # ===========================================
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")
    api_prefix: str = Field(default="/api/v1", description="API prefix")
    api_cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="CORS origins",
    )

    # ===========================================
    # JWT
    # ===========================================
    jwt_secret_key: str = Field(..., description="JWT secret key")
    jwt_algorithm: str = Field(default="HS256", description="JWT algorithm")
    jwt_access_token_expire_minutes: int = Field(
        default=30, description="Access token expiry"
    )
    jwt_refresh_token_expire_days: int = Field(
        default=7, description="Refresh token expiry"
    )

    # ===========================================
    # Telegram
    # ===========================================
    telegram_bot_token: str = Field(default="", description="Telegram bot token")
    telegram_webhook_url: str = Field(default="", description="Webhook URL")
    telegram_webhook_secret: str = Field(default="", description="Webhook secret")
    telegram_admin_ids: List[int] = Field(
        default=[], description="Admin Telegram IDs"
    )

    # ===========================================
    # Logging
    # ===========================================
    log_level: str = Field(default="INFO", description="Log level")
    log_format: str = Field(default="json", description="Log format")

    # ===========================================
    # Sentry
    # ===========================================
    sentry_dsn: str = Field(default="", description="Sentry DSN")
    sentry_environment: str = Field(
        default="development", description="Sentry environment"
    )

    # ===========================================
    # File Storage
    # ===========================================
    upload_dir: str = Field(default="./uploads", description="Upload directory")
    max_upload_size: int = Field(
        default=10485760, description="Max upload size in bytes"
    )

    @field_validator("api_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | List[str]) -> List[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            import json

            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

    @field_validator("telegram_admin_ids", mode="before")
    @classmethod
    def parse_admin_ids(cls, v: str | List[int]) -> List[int]:
        """Parse admin IDs from string or list."""
        if isinstance(v, str):
            if not v:
                return []
            return [int(x.strip()) for x in v.split(",") if x.strip()]
        return v

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.app_env == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

