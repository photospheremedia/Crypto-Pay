#!/usr/bin/env bash
# Import apps/portal/.env.local into linked Netlify site (all deploy contexts).
# Requires: netlify login && netlify link
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/portal/.env.local"
OUT="$ROOT/.netlify-env-import.tmp"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

cd "$ROOT"

if [[ -f "$ROOT/.netlify-env-import.tmp" ]]; then
  OUT="$ROOT/.netlify-env-import.tmp"
  echo "Using $OUT (from netlify:bootstrap)"
else
  grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' > "$OUT"
fi

if [[ ! -f "$ROOT/.netlify/state.json" ]]; then
  echo "Not linked. Run: pnpm netlify:link"
  exit 1
fi

pnpm exec netlify env:import "$OUT" --context production --replaceExisting
pnpm exec netlify env:import "$OUT" --context deploy-preview --replaceExisting
pnpm exec netlify env:import "$OUT" --context branch-deploy --replaceExisting
rm -f "$OUT"
echo "Done. netlify env:list"
