#!/usr/bin/env bash
# Verify PhotoSphere Supabase Auth SMTP (Resend) + edge secrets for email.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"
PORTAL_ENV="${PORTAL_ENV_FILE:-$ROOT/apps/portal/.env.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# shellcheck source=scripts/crypto-pay-supabase-env.sh
source "$ROOT/scripts/crypto-pay-supabase-env.sh"

REF="$CRYPTO_PAY_SUPABASE_PROJECT_REF"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN — run: pnpm supabase:connect"
  exit 1
fi

echo "==> Supabase × Resend configuration ($REF)"
echo ""

FAIL=0
warn() { echo "⚠️  $*"; }
ok() { echo "✓ $*"; }
bad() { echo "✗ $*"; FAIL=1; }

# Edge secrets
echo "Edge function secrets:"
if supabase secrets list --project-ref "$REF" 2>/dev/null | grep -q RESEND_API_KEY; then
  ok "RESEND_API_KEY present"
else
  bad "RESEND_API_KEY missing — run: pnpm resend:sync"
fi
for name in EMAIL_FROM EMAIL_REPLY_TO; do
  if supabase secrets list --project-ref "$REF" 2>/dev/null | grep -q "$name"; then
    ok "$name present"
  else
    warn "$name missing (runner-api / send-email may use defaults)"
  fi
done
echo ""

# Auth SMTP via Management API
AUTH_JSON="$(curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$REF/config/auth")"

python3 - "$AUTH_JSON" <<'PY' || FAIL=1
import json, sys

d = json.loads(sys.argv[1])

def check(cond, ok_msg, fail_msg):
    if cond:
        print(f"✓ {ok_msg}")
    else:
        print(f"✗ {fail_msg}")
        sys.exit(1)

check(d.get("external_email_enabled") is True, "Custom SMTP enabled", "external_email_enabled is false")
check(d.get("smtp_host") == "smtp.resend.com", "smtp_host = smtp.resend.com", f"smtp_host = {d.get('smtp_host')!r}")
check(str(d.get("smtp_port")) == "587", "smtp_port = 587", f"smtp_port = {d.get('smtp_port')!r}")
check(d.get("smtp_user") == "resend", "smtp_user = resend", f"smtp_user = {d.get('smtp_user')!r}")
check(bool(d.get("smtp_pass")), "smtp_pass is set", "smtp_pass is empty")
check(
    (d.get("smtp_admin_email") or "").endswith("@cryptopay.sale"),
    f"smtp_admin_email = {d.get('smtp_admin_email')}",
    f"smtp_admin_email should be @cryptopay.sale, got {d.get('smtp_admin_email')!r}",
)
check(
    d.get("mailer_autoconfirm") is False,
    "mailer_autoconfirm = false (signup must confirm email)",
    "mailer_autoconfirm is true — users skip email verification",
)
check(
    d.get("mailer_allow_unverified_email_sign_ins") is False,
    "unverified sign-ins blocked",
    "mailer_allow_unverified_email_sign_ins is true",
)

tpl = d.get("mailer_templates_confirmation_content") or ""
if "Crypto Pay" in tpl and len(tpl) > 500:
    print("✓ Branded confirmation email template on project")
else:
    print("⚠️  Confirmation template missing or short — run: cd apps/portal && pnpm email:sync-auth:push")

subj = d.get("mailer_subjects_confirmation") or ""
if "Crypto Pay" in subj:
    print(f"✓ Confirmation subject: {subj}")
else:
    print(f"⚠️  Unexpected confirmation subject: {subj!r}")
PY

echo ""
echo "Deployed functions (send-email / runner-api need RESEND_API_KEY):"
supabase functions list --project-ref "$REF" 2>/dev/null | grep -E 'send-email|runner-api' || warn "Could not list functions"

# Optional: compare portal RESEND key prefix with remote (cannot read secret value)
if [[ -f "$PORTAL_ENV" ]]; then
  portal_key="$(grep '^RESEND_API_KEY=' "$PORTAL_ENV" | cut -d= -f2- | tr -d '"' | tr -d "'")"
  if [[ -n "$portal_key" && "$portal_key" != __PASTE* ]]; then
    ok "Portal .env.local has RESEND_API_KEY (sync with pnpm resend:sync after rotation)"
  fi
fi

echo ""
if [[ "$FAIL" -ne 0 ]]; then
  echo "Fix issues above, then: pnpm resend:sync"
  exit 1
fi
echo "Supabase Resend configuration looks good."
echo "Portal check: cd apps/portal && pnpm email:verify"
