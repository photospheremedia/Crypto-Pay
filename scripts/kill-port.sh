#!/usr/bin/env bash
# Free a TCP port (default 3001 for portal dev).
set -euo pipefail
PORT="${1:-3001}"
PIDS=$(lsof -ti:"$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "Stopping process(es) on port $PORT: $PIDS"
  kill -9 $PIDS 2>/dev/null || true
  sleep 0.5
fi
