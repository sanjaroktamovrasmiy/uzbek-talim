# ===========================================
# API Backend Dockerfile
# Multi-stage build for optimized production image
# ===========================================

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency files
COPY packages/shared/pyproject.toml packages/shared/
COPY packages/db/pyproject.toml packages/db/
COPY apps/api/pyproject.toml apps/api/

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/db/ packages/db/
COPY apps/api/ apps/api/

# Install packages
RUN pip install --no-cache-dir \
    ./packages/shared \
    ./packages/db \
    ./apps/api

# Stage 2: Production
FROM python:3.11-slim as production

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash appuser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appuser apps/api/src /app/src
COPY --chown=appuser:appuser packages/ /app/packages/

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs \
    && chown -R appuser:appuser /app

USER appuser

# Environment
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

