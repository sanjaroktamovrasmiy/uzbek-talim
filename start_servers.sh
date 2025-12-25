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

mkdir -p "${ROOT_DIR}/logs"

PYTHON_BIN="python3"
if command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
fi

# Start API
(
  export PYTHONPATH="${ROOT_DIR}/apps/api:${ROOT_DIR}/packages/shared/src:${ROOT_DIR}/packages/db/src:${ROOT_DIR}:${PYTHONPATH:-}"
  nohup uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload \
    > "${ROOT_DIR}/logs/api.log" 2>&1 &
  echo $! > "${ROOT_DIR}/logs/api.pid"
)

# Start Bot
(
  export PYTHONPATH="${ROOT_DIR}/apps/bot:${ROOT_DIR}/packages/shared/src:${ROOT_DIR}/packages/db/src:${ROOT_DIR}:${PYTHONPATH:-}"
  nohup "$PYTHON_BIN" -m src.main \
    > "${ROOT_DIR}/logs/bot.log" 2>&1 &
  echo $! > "${ROOT_DIR}/logs/bot.pid"
)

echo "✅ Servers started! Logs: ${ROOT_DIR}/logs (api.log, bot.log)"
