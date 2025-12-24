# ===========================================
# Telegram Bot Dockerfile
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
COPY apps/bot/pyproject.toml apps/bot/

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/db/ packages/db/
COPY apps/bot/ apps/bot/

# Install packages
RUN pip install --no-cache-dir \
    ./packages/shared \
    ./packages/db \
    ./apps/bot

# Stage 2: Production
FROM python:3.11-slim as production

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash appuser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=appuser:appuser apps/bot/src /app/src
COPY --chown=appuser:appuser packages/ /app/packages/

# Create necessary directories
RUN mkdir -p /app/logs \
    && chown -R appuser:appuser /app

USER appuser

# Environment
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Run
CMD ["python", "-m", "src.main"]

