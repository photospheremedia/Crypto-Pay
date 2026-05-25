#!/usr/bin/env bash
# Sync Resend from apps/portal/.env.local → Supabase Edge secrets + Auth SMTP.
# Resend SMTP: host smtp.resend.com, port 587, user resend, password = API key.
# Docs: https://resend.com/docs/send-with-smtp
#       https://supabase.com/docs/guides/auth/auth-smtp
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${PORTAL_ENV_FILE:-$ROOT/apps/portal/.env.local}"
SUPABASE_ENV="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — add RESEND_API_KEY and EMAIL_FROM first."
  exit 1
fi

RESEND_API_KEY=""
EMAIL_FROM=""
EMAIL_REPLY_TO=""
PROJECT_REF="usbxwewohpsbjwiuazpf"
APP_URL="https://cryptopay.sale"

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  case "$line" in
    RESEND_API_KEY=*) RESEND_API_KEY="${line#RESEND_API_KEY=}";;
    EMAIL_FROM=*) EMAIL_FROM="${line#EMAIL_FROM=}";;
    EMAIL_REPLY_TO=*) EMAIL_REPLY_TO="${line#EMAIL_REPLY_TO=}";;
    SUPABASE_PROJECT_REF=*) PROJECT_REF="${line#SUPABASE_PROJECT_REF=}";;
    NEXT_PUBLIC_APP_URL=*) APP_URL="${line#NEXT_PUBLIC_APP_URL=}";;
  esac
done < "$ENV_FILE"

for v in RESEND_API_KEY EMAIL_FROM; do
  val="${!v}"
  val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  printf -v "$v" '%s' "$val"
done
EMAIL_REPLY_TO="${EMAIL_REPLY_TO%\"}"; EMAIL_REPLY_TO="${EMAIL_REPLY_TO#\"}"
EMAIL_REPLY_TO="${EMAIL_REPLY_TO:-support@cryptopay.sale}"
APP_URL="${APP_URL%\"}"; APP_URL="${APP_URL#\"}"

if [[ -z "$RESEND_API_KEY" || "$RESEND_API_KEY" == __PASTE* ]]; then
  echo "RESEND_API_KEY missing in $ENV_FILE"
  exit 1
fi
if [[ ! "$RESEND_API_KEY" =~ ^re_ ]]; then
  echo "RESEND_API_KEY should start with re_"
  exit 1
fi
if [[ -z "$EMAIL_FROM" || "$EMAIL_FROM" == __PASTE* ]]; then
  EMAIL_FROM="Crypto Pay <noreply@cryptopay.sale>"
fi

# Extract bare email for Supabase smtp_admin_email
SMTP_ADMIN_EMAIL="$(echo "$EMAIL_FROM" | sed -n 's/.*<\([^>]*\)>.*/\1/p')"
if [[ -z "$SMTP_ADMIN_EMAIL" ]]; then
  SMTP_ADMIN_EMAIL="$EMAIL_FROM"
fi

if [[ -f "$SUPABASE_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$SUPABASE_ENV"
  set +a
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN required (.env.supabase). Run: pnpm supabase:connect"
  exit 1
fi

echo "==> Supabase Edge Function secrets (project $PROJECT_REF)"
cd "$ROOT"
supabase secrets set \
  "RESEND_API_KEY=${RESEND_API_KEY}" \
  "EMAIL_FROM=${EMAIL_FROM}" \
  "EMAIL_REPLY_TO=${EMAIL_REPLY_TO}" \
  --project-ref "$PROJECT_REF"

echo "==> Supabase Auth SMTP (Resend)"
SMTP_JSON="$(APP_URL="$APP_URL" RESEND_API_KEY="$RESEND_API_KEY" SMTP_ADMIN_EMAIL="$SMTP_ADMIN_EMAIL" python3 -c "
import json, os
print(json.dumps({
  'external_email_enabled': True,
  'site_url': os.environ['APP_URL'],
  'uri_allow_list': ','.join([
    os.environ['APP_URL'] + '/**',
    'https://www.cryptopay.sale/**',
    'http://localhost:3000/**',
    'http://localhost:3001/**',
  ]),
  'smtp_host': 'smtp.resend.com',
  'smtp_port': '587',
  'smtp_user': 'resend',
  'smtp_pass': os.environ['RESEND_API_KEY'],
  'smtp_admin_email': os.environ['SMTP_ADMIN_EMAIL'],
  'smtp_sender_name': 'Crypto Pay',
  'mailer_autoconfirm': True,
  'rate_limit_email_sent': 30,
}))
")"

HTTP_CODE="$(curl -s -o /tmp/supabase-smtp-patch.json -w "%{http_code}" -X PATCH \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SMTP_JSON")"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Auth SMTP PATCH failed (HTTP ${HTTP_CODE}):" >&2
  cat /tmp/supabase-smtp-patch.json >&2
  exit 1
fi

python3 -c "import json; d=json.load(open('/tmp/supabase-smtp-patch.json')); print('  smtp_host:', d.get('smtp_host')); print('  smtp_admin_email:', d.get('smtp_admin_email')); print('  site_url:', d.get('site_url'))"
rm -f /tmp/supabase-smtp-patch.json

echo "Done. Run pnpm netlify:env-sync to push RESEND_API_KEY to Netlify."
