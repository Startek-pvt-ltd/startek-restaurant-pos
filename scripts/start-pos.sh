#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RUNTIME_DIR="$PROJECT_DIR/.pos-runtime"
PID_FILE="$RUNTIME_DIR/pos.pid"
LOG_FILE="$RUNTIME_DIR/pos.log"
POS_HOST="${POS_HOST:-127.0.0.1}"
POS_PORT="${POS_PORT:-3000}"

cd "$PROJECT_DIR"
umask 077

for command_name in node npm npx curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is unavailable: $command_name" >&2
    exit 1
  fi
done

if [[ ! -f "$PROJECT_DIR/.env" ]]; then
  echo "Missing .env. Copy .env.example and add installation-specific values." >&2
  exit 1
fi

node --env-file="$PROJECT_DIR/.env" "$SCRIPT_DIR/validate-env.mjs"

mkdir -p "$RUNTIME_DIR"
if [[ -f "$PID_FILE" ]]; then
  existing_pid="$(tr -cd '0-9' < "$PID_FILE")"
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    echo "Startek Restaurant POS is already running (PID $existing_pid)."
    exit 0
  fi
  mv "$PID_FILE" "$PID_FILE.stale.$(date +%s)"
fi

echo "Installing locked dependencies..."
npm ci
echo "Generating Prisma Client..."
npx prisma generate
echo "Applying production database migrations..."
npx prisma migrate deploy
echo "Building the production application..."
npm run build

echo "Starting Startek Restaurant POS on $POS_HOST:$POS_PORT..."
nohup npm run start -- --hostname "$POS_HOST" --port "$POS_PORT" >"$LOG_FILE" 2>&1 &
pos_pid=$!
printf '%s\n' "$pos_pid" > "$PID_FILE"

for _attempt in {1..30}; do
  if POS_URL="http://127.0.0.1:$POS_PORT" "$SCRIPT_DIR/health-check.sh" >/dev/null 2>&1; then
    echo "Startek Restaurant POS is running at http://localhost:$POS_PORT"
    echo "Log: $LOG_FILE"
    exit 0
  fi
  if ! kill -0 "$pos_pid" 2>/dev/null; then
    echo "The POS process stopped during startup. Check $LOG_FILE" >&2
    exit 1
  fi
  sleep 1
done

echo "The POS did not become healthy within 30 seconds. Check $LOG_FILE" >&2
"$SCRIPT_DIR/stop-pos.sh" >/dev/null 2>&1 || true
exit 1
