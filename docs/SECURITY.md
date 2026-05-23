# Security Notes

## No secrets in git
- Never commit `.env` files.
- All secrets must be set in Vercel or local `.env.local`.
- The repo only includes placeholder values.

## If a secret leaks
1. Rotate the secret immediately (Supabase, delivery provider, etc.).
2. Remove the leaked value from git history if it was committed.
3. Re-deploy with updated environment variables.

## Access control
- Supabase RLS enforces tenant isolation.
- Admin-only operations are gated by the `rhs_admin` role.
