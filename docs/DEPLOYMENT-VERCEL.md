# Vercel Deployment (Portal)

## Import steps
1. Go to Vercel → New Project → Import Git Repository.
2. Select the `crypto-pay` repo.
3. Framework preset: **Other** (monorepo root, build command handles Next.js).
4. Root Directory: `.` (repo root).
5. Build Command: `pnpm build:portal`.
6. Output Directory: `apps/portal/.next`.
7. Install Command: `pnpm install`.
8. Add environment variables (see `docs/ENVIRONMENT.md`).
9. Deploy.

Important:
- Keep Root Directory at repo root so workspace packages resolve correctly.
- If you set Root Directory to `apps/portal`, pnpm workspace dependencies will not install.

## Monorepo notes
If you deploy the optional storefront later:
- Root Directory: `.`
- Build Command: `pnpm build:storefront`
- Output Directory: `apps/storefront/.next`

## CI sanity
Use the root scripts when needed:
- `pnpm build:portal`
- `pnpm build:storefront`
