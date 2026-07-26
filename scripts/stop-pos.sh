#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_DIR/.pos-runtime/pos.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "Startek Restaurant POS is not running (no PID file)."
  exit 0
fi

pos_pid="$(tr -cd '0-9' < "$PID_FILE")"
if [[ -z "$pos_pid" ]]; then
  echo "Invalid POS PID file; leaving it in place for inspection." >&2
  exit 1
fi

if ! kill -0 "$pos_pid" 2>/dev/null; then
  mv "$PID_FILE" "$PID_FILE.stale.$(date +%s)"
  echo "Startek Restaurant POS was already stopped. The stale PID file was preserved."
  exit 0
fi

command_line="$(ps -p "$pos_pid" -o command= 2>/dev/null || true)"
if [[ "$command_line" != *"npm run start"* ]] && [[ "$command_line" != *"next start"* ]]; then
  echo "PID $pos_pid does not look like the POS process; refusing to stop it." >&2
  exit 1
fi

children="$(pgrep -P "$pos_pid" 2>/dev/null || true)"
if [[ -n "$children" ]]; then
  kill -TERM $children 2>/dev/null || true
fi
kill -TERM "$pos_pid"

for _attempt in {1..10}; do
  if ! kill -0 "$pos_pid" 2>/dev/null; then
    mv "$PID_FILE" "$PID_FILE.stopped.$(date +%s)"
    echo "Startek Restaurant POS stopped safely."
    exit 0
  fi
  sleep 1
done

echo "POS did not stop within 10 seconds; PID file retained for manual inspection." >&2
exit 1
