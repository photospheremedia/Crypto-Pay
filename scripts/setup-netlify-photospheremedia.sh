#!/usr/bin/env bash
# Deploy Crypto Pay via Netlify + GitHub (no Vercel phone signup).
#
# 1. https://app.netlify.com/signup → Continue with GitHub (photospheremedia)
# 2. Use existing site crypto-pay-portal OR import once (avoid a second "Crypto-Pay" site)
# 3. Build settings are read from netlify.toml (no changes needed)
# 4. Site settings → Environment variables (copy from apps/portal/.env.local)
# 5. Deploy — production branch: master
#
# Usage: pnpm netlify:setup
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GITHUB_REPO="photospheremedia/Crypto-Pay"
IMPORT_URL="https://app.netlify.com/start/deploy?repository=https://github.com/${GITHUB_REPO}"

cat <<EOF
==> Netlify + GitHub (PhotoSphere Media)

GitHub repo: https://github.com/${GITHUB_REPO}
Import URL:  ${IMPORT_URL}

Signup (if needed):
  - Use "Continue with GitHub" — avoid phone-only signup issues.

After import, add environment variables in Netlify UI
(Site configuration → Environment variables):

  Required:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
    NEXT_PUBLIC_APP_URL          (e.g. https://your-site.netlify.app)

  Recommended:
    RESEND_API_KEY
    EMAIL_FROM
    NEXT_PUBLIC_TURNSTILE_SITE_KEY
    TURNSTILE_SECRET_KEY
    GROQ_API_KEY

Supabase project: usbxwewohpsbjwiuazpf (PhotoSphere)

CLI (optional):
  npm i -g netlify-cli
  netlify login
  netlify link
  pnpm netlify:env-sync   # if .env.local is filled

GitHub Actions (auto deploy on push, like Supabase):
  cp .env.netlify.example .env.netlify
  # Add NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID (or rely on netlify link for site id)
  gh auth login
  pnpm netlify:secrets

DNS (Porkbun → Netlify):
  cp .env.porkbun.example .env.porkbun
  # Add Porkbun API keys + NETLIFY_SITE_HOSTNAME
  pnpm dns:plan && pnpm dns:apply

EOF

if [[ "$(uname -s)" == "Darwin" ]]; then
  open "$IMPORT_URL" 2>/dev/null || true
  open "https://app.netlify.com/signup" 2>/dev/null || true
fi
