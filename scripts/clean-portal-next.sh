#!/usr/bin/env bash
# Remove apps/portal/.next (handles Turbopack cache dirs that plain rm -rf can miss).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEXT_DIR="$ROOT/apps/portal/.next"
if [ -d "$NEXT_DIR" ]; then
  echo "Removing $NEXT_DIR"
  node -e "require('fs').rmSync(process.argv[1],{recursive:true,force:true})" "$NEXT_DIR"
fi
