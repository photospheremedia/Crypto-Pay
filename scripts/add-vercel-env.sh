#!/usr/bin/env bash
# Securely add/update a Vercel project environment variable.
# Usage (interactive secret):
#   VERCEL_TOKEN=xxxx PROJECT=your-project-name ./add-vercel-env.sh SUPABASE_SERVICE_ROLE_KEY production
# Usage (from env var):
#   VERCEL_TOKEN=xxxx PROJECT=your-project-name SUPABASE_KEY=sbp_xxx ./add-vercel-env.sh SUPABASE_SERVICE_ROLE_KEY production
# NOTE: This script runs locally and requires your Vercel access token. It does NOT persist secrets in the repo.
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Error: VERCEL_TOKEN must be set in the environment"
  exit 1
fi
if [ -z "${PROJECT:-}" ]; then
  echo "Error: PROJECT (project id or name) must be set in the environment"
  exit 1
fi
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 VAR_NAME target1[,target2,...]"
  echo "Example: $0 SUPABASE_SERVICE_ROLE_KEY production,preview"
  exit 1
fi

VAR_NAME="$1"
TARGETS_RAW="$2"

# Read secret from SUPABASE_KEY env var if present, otherwise read from stdin (secure prompt)
if [ -n "${SUPABASE_KEY:-}" ]; then
  SECRET_VALUE="${SUPABASE_KEY}"
else
  echo -n "Enter value for ${VAR_NAME}: "
  read -r -s SECRET_VALUE
  echo
fi

# Convert targets CSV to JSON array
IFS=',' read -ra TARGETS_ARR <<< "$TARGETS_RAW"
TARGETS_JSON="["
first=true
for t in "${TARGETS_ARR[@]}"; do
  if [ "$first" = true ]; then
    TARGETS_JSON+="\"$t\""
    first=false
  else
    TARGETS_JSON+=" , \"$t\""
  fi
done
TARGETS_JSON+"]"

API_URL="https://api.vercel.com/v9/projects/${PROJECT}/env"

payload=$(jq -n --arg key "$VAR_NAME" --arg value "$SECRET_VALUE" --argjson target "$TARGETS_JSON" '{key: $key, value: $value, target: $target, type: "encrypted"}')

# POST to create. If var exists, the API will return conflict — in that case, update by deleting then creating.
resp=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$payload")

body=$(echo "$resp" | sed '$d')
code=$(echo "$resp" | tail -n1)

if [ "$code" = "200" ] || [ "$code" = "201" ]; then
  echo "Environment variable ${VAR_NAME} added/updated successfully."
  echo "$body" | jq .
  exit 0
fi

# If conflict or other error, show message
echo "Failed to add env var (HTTP $code). Response:" >&2
echo "$body" | jq . >&2 || echo "$body" >&2
exit 1
