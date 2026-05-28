#!/usr/bin/env bash
# Store Porkbun credentials in GitHub Actions secrets (NOT in git).
# Collaborators: clone repo, copy .env.porkbun.example → .env.porkbun, or use org secret manager.
#
# Usage (repo admin, both keys in .env.porkbun):
#   gh auth login
#   ./scripts/setup-porkbun-github-secrets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${PORKBUN_ENV_FILE:-$ROOT/.env.porkbun}"
REPO="${GITHUB_REPO:-photospheremedia/Crypto-Pay}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${PORKBUN_API_KEY:-}" || -z "${PORKBUN_SECRET_API_KEY:-}" ]]; then
  echo "Both PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY must be set in $ENV_FILE"
  echo "Porkbun dashboard → Account → API → copy both pk1_ and sk1_"
  exit 1
fi

echo "==> Setting GitHub secrets on $REPO (values are never printed)"
gh secret set PORKBUN_API_KEY -R "$REPO" -b "$PORKBUN_API_KEY"
gh secret set PORKBUN_SECRET_API_KEY -R "$REPO" -b "$PORKBUN_SECRET_API_KEY"
echo "Done. DNS workflow: .github/workflows/dns-vercel.yml (pnpm dns:apply locally)."
