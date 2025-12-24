"""
Exception handlers for FastAPI.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from shared.exceptions import (
    AppException,
    NotFoundError,
    ValidationError,
    AuthenticationError,
    PermissionDeniedError,
)


logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers."""

    @app.exception_handler(AppException)
    async def app_exception_handler(
        request: Request,
        exc: AppException,
    ) -> JSONResponse:
        """Handle application exceptions."""
        logger.warning(
            f"Application error: {exc.error_code} - {exc.message}",
            extra={"path": request.url.path, "details": exc.details},
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(
        request: Request,
        exc: NotFoundError,
    ) -> JSONResponse:
        """Handle not found errors."""
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(ValidationError)
    async def validation_error_handler(
        request: Request,
        exc: ValidationError,
    ) -> JSONResponse:
        """Handle validation errors."""
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(AuthenticationError)
    async def auth_error_handler(
        request: Request,
        exc: AuthenticationError,
    ) -> JSONResponse:
        """Handle authentication errors."""
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(PermissionDeniedError)
    async def permission_error_handler(
        request: Request,
        exc: PermissionDeniedError,
    ) -> JSONResponse:
        """Handle permission errors."""
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.to_dict(),
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        """Handle unexpected exceptions."""
        logger.exception(
            f"Unexpected error: {exc}",
            extra={"path": request.url.path},
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                }
            },
        )

