-- Local/production admin users are provisioned outside migrations:
--   pnpm dev:setup  → apps/portal/scripts/setup-local-dev-user.ts
-- Allowlisted emails: apps/portal/lib/admin-email.ts
--
-- This migration previously seeded operator-specific auth rows; that is removed
-- so resets do not depend on committed personal emails.

SELECT 1;
