"""
Custom exceptions for the application.

Centralized exception handling across all services.
"""

from typing import Any, Dict, Optional


class AppException(Exception):
    """Base application exception."""

    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred"

    def __init__(
        self,
        message: Optional[str] = None,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        self.message = message or self.message
        self.error_code = error_code or self.error_code
        self.details = details or {}
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API response."""
        return {
            "error": {
                "code": self.error_code,
                "message": self.message,
                "details": self.details,
            }
        }


class NotFoundError(AppException):
    """Resource not found."""

    status_code = 404
    error_code = "NOT_FOUND"
    message = "Resource not found"

    def __init__(
        self,
        resource: str = "Resource",
        resource_id: Optional[str | int] = None,
        **kwargs: Any,
    ) -> None:
        message = f"{resource} not found"
        if resource_id:
            message = f"{resource} with id '{resource_id}' not found"
        super().__init__(message=message, **kwargs)


class ValidationError(AppException):
    """Validation error."""

    status_code = 422
    error_code = "VALIDATION_ERROR"
    message = "Validation failed"

    def __init__(
        self,
        message: str = "Validation failed",
        errors: Optional[Dict[str, list]] = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(message=message, details={"errors": errors or {}}, **kwargs)


class AuthenticationError(AppException):
    """Authentication failed."""

    status_code = 401
    error_code = "AUTHENTICATION_FAILED"
    message = "Authentication failed"


class PermissionDeniedError(AppException):
    """Permission denied."""

    status_code = 403
    error_code = "PERMISSION_DENIED"
    message = "You don't have permission to perform this action"


class ConflictError(AppException):
    """Resource conflict."""

    status_code = 409
    error_code = "CONFLICT"
    message = "Resource conflict"


class RateLimitError(AppException):
    """Rate limit exceeded."""

    status_code = 429
    error_code = "RATE_LIMIT_EXCEEDED"
    message = "Too many requests. Please try again later"


class ExternalServiceError(AppException):
    """External service error."""

    status_code = 502
    error_code = "EXTERNAL_SERVICE_ERROR"
    message = "External service is unavailable"


class PaymentError(AppException):
    """Payment processing error."""

    status_code = 402
    error_code = "PAYMENT_ERROR"
    message = "Payment processing failed"

