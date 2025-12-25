#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Optional venv activation (recommended)
if [ -f ".venv/bin/activate" ]; then
  # shellcheck disable=SC1091
  source ".venv/bin/activate"
fi

# Ensure environment file exists (never commit `.env`)
if [ ! -f ".env" ]; then
  echo "❌ Missing .env. Create it from .env.example and fill required values." >&2
  exit 1
fi

# Run from repo root so shared Settings can load `.env` via Pydantic
# and avoid `source .env` (which breaks if values contain spaces).
export PYTHONPATH="${ROOT_DIR}/apps/bot:${ROOT_DIR}/packages/shared/src:${ROOT_DIR}/packages/db/src:${ROOT_DIR}:${PYTHONPATH:-}"

PYTHON_BIN="python3"
if command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
fi

exec "$PYTHON_BIN" -m src.main
