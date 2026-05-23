#!/usr/bin/env bash
# Trigger a Vercel deployment for this repo.
# Prefer Vercel CLI; falls back to instructing how to trigger via git or deploy hook.
# Usage:
#   VERCEL_TOKEN=xxx ./scripts/trigger-vercel-deploy.sh [--prod]
set -euo pipefail

PROD=false
if [ "${1:-}" = "--prod" ]; then
  PROD=true
fi

if command -v vercel >/dev/null 2>&1; then
  echo "Using Vercel CLI to deploy."
  if [ -z "${VERCEL_TOKEN:-}" ]; then
    read -rp "VERCEL_TOKEN not set. Enter token: " TOK
    export VERCEL_TOKEN="$TOK"
  fi
  CMD=(vercel)
  if [ "$PROD" = true ]; then
    CMD+=(--prod --confirm)
  fi
  CMD+=(--token "$VERCEL_TOKEN")
  echo "Running: ${CMD[*]}"
  # shellcheck disable=SC2086
  eval "${CMD[*]}"
  exit $?
fi

cat <<'MSG'
Vercel CLI not found. Options to trigger a deploy:

1) Install Vercel CLI and run this script again:
   npm i -g vercel
   VERCEL_TOKEN=xxx ./scripts/trigger-vercel-deploy.sh --prod

2) Push to your connected Git branch (e.g., main) to trigger an automatic deployment:
   git add . && git commit -m "Trigger deploy" && git push origin main

3) Use a Deploy Hook (recommended for CI):
   - Create a Deploy Hook in the Vercel dashboard (Project Settings → Git → Deploy Hooks)
   - Trigger it with:
     curl -X POST https://api.vercel.com/v1/integrations/deploy/<hook-id>

If you want, I can try to create a deploy hook via the Vercel API for you (you must run the script locally with your VERCEL_TOKEN and PROJECT).
MSG
