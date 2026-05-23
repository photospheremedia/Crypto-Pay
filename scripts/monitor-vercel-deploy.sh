#!/usr/bin/env bash
# Monitor latest Vercel deployment for a project until completion.
# Usage: VERCEL_TOKEN=xxx PROJECT=your-project-id-or-name ./scripts/monitor-vercel-deploy.sh [--wait-seconds 5] [--timeout 600]
set -euo pipefail

WAIT=5
TIMEOUT=600
while [[ $# -gt 0 ]]; do
  case "$1" in
    --wait-seconds) WAIT="$2"; shift 2 ;;
    --timeout) TIMEOUT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Error: VERCEL_TOKEN must be set"
  exit 1
fi
if [ -z "${PROJECT:-}" ]; then
  echo "Error: PROJECT must be set (project id or name)"
  exit 1
fi

API_PROJECT_URL="https://api.vercel.com/v9/projects/${PROJECT}"

start_ts=$(date +%s)

echo "Monitoring latest deployment for project: ${PROJECT} (poll every ${WAIT}s, timeout ${TIMEOUT}s)"

while true; do
  resp=$(curl -sS -H "Authorization: Bearer ${VERCEL_TOKEN}" "$API_PROJECT_URL") || { echo "Failed to fetch project" >&2; exit 1; }

  # Extract latest deployment info
  latest_id=$(echo "$resp" | jq -r '.latestDeployments[0].id // empty')
  latest_state=$(echo "$resp" | jq -r '.latestDeployments[0].readyState // empty')
  latest_url=$(echo "$resp" | jq -r '.latestDeployments[0].url // empty')
  latest_created=$(echo "$resp" | jq -r '.latestDeployments[0].createdAt // empty')

  if [ -z "$latest_id" ]; then
    echo "No deployments found yet. Waiting ${WAIT}s..."
  else
    echo "Deployment: $latest_id  state=$latest_state  url=$latest_url  createdAt=$latest_created"
  fi

  if [ "$latest_state" = "READY" ]; then
    echo "Deployment succeeded: $latest_url"
    exit 0
  fi
  if [ "$latest_state" = "ERROR" ] || [ "$latest_state" = "CANCELED" ] || [ "$latest_state" = "FAILED" ]; then
    echo "Deployment failed or canceled. See Vercel dashboard for logs."
    echo "$resp" | jq '.latestDeployments[0]'
    exit 2
  fi

  elapsed=$(( $(date +%s) - start_ts ))
  if [ $elapsed -ge $TIMEOUT ]; then
    echo "Timeout ($TIMEOUT seconds) waiting for deployment. Latest state: $latest_state"
    echo "$resp" | jq '.latestDeployments[0]'
    exit 3
  fi

  sleep "$WAIT"
done
