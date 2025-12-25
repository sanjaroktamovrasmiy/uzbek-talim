"""
FastAPI Application Entry Point.
"""

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from shared import get_settings
from db.session import init_db, close_db

from src.api import router as api_router
from src.core.middleware import (
    RequestLoggingMiddleware,
    RateLimitMiddleware,
)
from src.core.exception_handlers import register_exception_handlers


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan events.

    Handles startup and shutdown events.
    """
    # Startup
    if settings.debug:
        await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""

    app = FastAPI(
        title="Uzbek Ta'lim API",
        description="Professional Ta'lim Markazi API",
        version="1.0.0",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.api_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom Middlewares
    app.add_middleware(RequestLoggingMiddleware)
    if not settings.debug:
        app.add_middleware(RateLimitMiddleware)

    # Exception Handlers
    register_exception_handlers(app)

    # Routes
    app.include_router(api_router, prefix=settings.api_prefix)

    # Static files for uploads
    from fastapi.staticfiles import StaticFiles
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

    # Health check
    @app.get("/health")
    async def health_check() -> dict:
        """Health check endpoint."""
        return {"status": "healthy", "version": "1.0.0"}

    return app


# Application instance
app = create_app()

