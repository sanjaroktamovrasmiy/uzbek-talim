"""
Custom middlewares.
"""

import time
import logging
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from shared import get_settings


settings = get_settings()
logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging requests."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """Log request details."""
        start_time = time.time()

        # Get request info
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log request
        logger.info(
            f"{method} {path} - {response.status_code} - {duration:.3f}s - {client_ip}"
        )

        # Add timing header
        response.headers["X-Process-Time"] = f"{duration:.3f}"

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.

    For production, use Redis-based rate limiting.
    """

    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: dict = {}

    async def dispatch(
        self,
        request: Request,
        call_next: Callable,
    ) -> Response:
        """Check rate limit."""
        # Skip rate limiting for health checks
        if request.url.path == "/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()

        # Clean old entries
        self.requests = {
            ip: times
            for ip, times in self.requests.items()
            if times and times[-1] > current_time - 60
        }

        # Check rate limit
        if client_ip in self.requests:
            # Remove old timestamps
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] if t > current_time - 60
            ]

            if len(self.requests[client_ip]) >= self.requests_per_minute:
                return Response(
                    content='{"error": "Rate limit exceeded"}',
                    status_code=429,
                    media_type="application/json",
                )

        # Add current request
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        self.requests[client_ip].append(current_time)

        return await call_next(request)

