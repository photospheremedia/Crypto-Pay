#!/usr/bin/env bash
# Configure Netlify deploy email notifications for Crypto Pay.
#
# Sends alerts to NETLIFY_NOTIFY_EMAIL (default: photospheremedia00@gmail.com).
# Requires Netlify auth: pnpm netlify:connect (or NETLIFY_AUTH_TOKEN in .env.netlify).
#
# Usage:
#   pnpm netlify:notifications
#   NETLIFY_NOTIFY_EMAIL=you@example.com pnpm netlify:notifications
#   ./scripts/setup-netlify-notifications.sh --dry-run
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/netlify-site.sh
source "$ROOT/scripts/lib/netlify-site.sh"

ENV_FILE="${NETLIFY_ENV_FILE:-$ROOT/.env.netlify}"
DEFAULT_NOTIFY_EMAIL="photospheremedia00@gmail.com"
NOTIFY_EMAIL="${NETLIFY_NOTIFY_EMAIL:-$DEFAULT_NOTIFY_EMAIL}"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true ;;
    --email)
      NOTIFY_EMAIL="${2:?missing email after --email}"
      shift
      ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
  shift
done

load_token() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    NOTIFY_EMAIL="${NETLIFY_NOTIFY_EMAIL:-$NOTIFY_EMAIL}"
  fi
  if [[ -n "${NETLIFY_AUTH_TOKEN:-}${NETLIFY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
    return 0
  fi
  # Fall back to Netlify CLI session (netlify login)
  pnpm exec netlify status >/dev/null 2>&1
}

if ! load_token; then
  echo "Missing Netlify auth."
  echo "  pnpm netlify:login"
  echo "  # or cp .env.netlify.example .env.netlify and pnpm netlify:connect"
  exit 1
fi

export NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-${NETLIFY_PERSONAL_ACCESS_TOKEN:-}}"

nl_api() {
  pnpm exec netlify api "$@"
}

# event|subject_template
NOTIFICATIONS=(
  "deploy_failed|[Crypto Pay] Deploy FAILED"
  "deploy_failed_after_succeeding|[Crypto Pay] Production deploy regressed (was OK, now failed)"
  "deploy_succeeded_after_failing|[Crypto Pay] Deploy recovered after failure"
  "deploy_created|[Crypto Pay] Deploy succeeded"
  "deploy_locked|[Crypto Pay] Deploy locked (auto-publish paused)"
  "deploy_unlocked|[Crypto Pay] Deploy unlocked (auto-publish resumed)"
  "deploy_deleted|[Crypto Pay] Deploy deleted"
  "deploy_request_pending|[Crypto Pay] Deploy approval required"
  "deploy_request_accepted|[Crypto Pay] Deploy request accepted"
  "deploy_request_rejected|[Crypto Pay] Deploy request rejected"
  "submission_created|[Crypto Pay] New form submission"
)

echo "==> Netlify deploy notifications"
echo "    Site:   $NETLIFY_SITE_NAME ($NETLIFY_SITE_ID)"
echo "    Email:  $NOTIFY_EMAIL"
echo ""

existing_json="$(nl_api listHooksBySiteId --data "{\"site_id\":\"$NETLIFY_SITE_ID\"}")"

hook_exists() {
  local event="$1"
  echo "$existing_json" | jq -e --arg event "$event" --arg email "$NOTIFY_EMAIL" '
    [.[] | select(.type == "email" and .event == $event and (.data.email // "") == $email)] | length > 0
  ' >/dev/null
}

created=0
skipped=0

for entry in "${NOTIFICATIONS[@]}"; do
  event="${entry%%|*}"
  subject="${entry#*|}"

  if hook_exists "$event"; then
    echo "  skip  $event (already configured)"
    skipped=$((skipped + 1))
    continue
  fi

  body="$(jq -nc \
    --arg type "email" \
    --arg event "$event" \
    --arg email "$NOTIFY_EMAIL" \
    --arg subject "$subject" \
    '{type: $type, event: $event, data: {email: $email, subject_template: $subject}}')"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  dry   would create $event"
    created=$((created + 1))
    continue
  fi

  if nl_api createHookBySiteId --data "{\"site_id\":\"$NETLIFY_SITE_ID\",\"body\":$body}" >/dev/null; then
    echo "  add   $event"
    created=$((created + 1))
  else
    echo "  fail  $event" >&2
    exit 1
  fi
done

echo ""
echo "Done: $created created, $skipped already present."
echo ""
echo "Dashboard: https://app.netlify.com/sites/$NETLIFY_SITE_NAME/configuration/notifications#deploy-notifications"
echo ""
echo "Note: Netlify email deploy notifications require a Pro (or Enterprise) plan."
echo "GitHub commit checks are already enabled for deploy status on pull requests."
