#!/bin/bash
set -euo pipefail

POS_URL="${POS_URL:-http://localhost:${POS_PORT:-3000}}"
response="$(curl --fail --silent --show-error --max-time 5 "$POS_URL/api/health")"

if [[ "$response" != *'"status":"healthy"'* ]] || [[ "$response" != *'"database":"connected"'* ]]; then
  echo "POS health check returned an unexpected response." >&2
  exit 1
fi

echo "Startek Restaurant POS is healthy at $POS_URL"
