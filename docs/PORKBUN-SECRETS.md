# Porkbun credentials (collaborators)

**Never commit API keys to git.** `.env.porkbun` is gitignored.

## Local setup

```bash
cp .env.porkbun.example .env.porkbun
# Add pk1_ and sk1_ from https://porkbun.com/account/api
# Enable API Access on cryptopay.sale (Domain Management → Details)
pnpm porkbun:ping
```

## Shared team access (recommended)

Repo admins store secrets in GitHub (not in the repository):

```bash
# Fill .env.porkbun with both keys, then:
./scripts/setup-porkbun-github-secrets.sh
```

Collaborators running DNS workflows in CI use those secrets. For local DNS edits, each person uses their own `.env.porkbun` or gets keys from your team password manager.

## If a key was exposed

Revoke and create new keys at [porkbun.com/account/api](https://porkbun.com/account/api), then update GitHub secrets and local `.env.porkbun`.
