# Contributing to Crypto Pay

Guidance for collaborators using Git and GitHub on this repo.

- **Repository:** https://github.com/photospheremedia/Crypto-Pay
- **Default branch:** `master` (production deploys and Supabase migrations run from here)
- **Local setup:** see [README.md](README.md)

---

## Workflow overview

```text
master  ←── merge via PR ──  your-branch
  ↑
  └── production Netlify + Supabase (when paths match CI filters)
```

1. Branch from up-to-date `master`.
2. Commit in small, logical steps.
3. Open a pull request (PR) into `master`.
4. Wait for CI checks; address review feedback.
5. Merge when approved. Do not push directly to `master` unless you own release/deploy duties and understand the blast radius.

---

## Branches

| Rule | Detail |
|------|--------|
| **Base branch** | `master` |
| **Naming** | Short, kebab-case, purpose-first: `fix/password-api`, `feat/locale-pricing`, `chore/deps-bump` |
| **Lifetime** | Delete the branch after merge (GitHub option or locally: `git branch -d branch-name`) |
| **Sync** | Rebase or merge `master` into your branch before opening/updating a PR if `master` has moved |

```bash
git fetch origin
git checkout master
git pull origin master
git checkout -b feat/your-change
```

---

## Commits

Write messages in **imperative mood**, one clear idea per commit (matches existing history).

**Good**

- `Fix password API to verify current password safely.`
- `Add admin users module with searchable list and user management tools.`
- `Harden Supabase CI secret validation and skip-on-invalid auth.`

**Avoid**

- Vague: `fix stuff`, `updates`, `WIP`
- Dump commits: one PR should not be a single “everything” commit unless truly atomic
- Secrets, generated noise, or unrelated file churn in the same commit

**Before you commit**

```bash
git status          # know what you’re staging
git diff            # review unstaged changes
git diff --staged   # review what will be committed
```

**Never commit** (see `.gitignore`):

- `.env`, `.env.local`, `.env.porkbun`, `.env.netlify`, and other env files with real keys
- `node_modules`, `.next`, build artifacts, logs, HAR captures, backup dumps
- OAuth guides or captures that may contain tokens (`GOOGLE_*.md`, `*.har`, etc.)

Use `apps/portal/.env.example` as the template; keep secrets in local env or GitHub/Netlify/Supabase secret stores only.

---

## Pull requests

1. **Title** — Same style as commits: what changed and why in one line.
2. **Description** — What/why, how to test, screenshots for UI, note migrations or env changes.
3. **Scope** — Prefer focused PRs; large refactors need explicit agreement first (see [.github/copilot-instructions.md](.github/copilot-instructions.md) refactoring rules).
4. **Checks** — Fix failing CI before merge; don’t merge with red checks unless a maintainer documents an exception.

Create a PR from the CLI (optional):

```bash
gh pr create --base master --title "Your title" --body "$(cat <<'EOF'
## Summary
- …

## Test plan
- [ ] …
EOF
)"
```

---

## What CI runs

Path filters mean **not every push runs every workflow**. If your change is outside these paths, the related workflow may not run on the PR.

| Workflow | File | Triggers on PR | Deploys on push to `master` |
|----------|------|----------------|------------------------------|
| **Netlify CI/CD** | [.github/workflows/netlify.yml](.github/workflows/netlify.yml) | Typecheck `@crypto-pay/portal`; optional Netlify preview if repo secrets are set | Production deploy when portal/packages/`netlify.toml`/lockfile change |
| **Supabase CI/CD** | [.github/workflows/supabase.yml](.github/workflows/supabase.yml) | Migration lint (dry-run) | Applies migrations when `supabase/**` changes |

**Implications**

- Portal-only UI work: Netlify validate (and preview if configured) should run.
- Schema changes: include `supabase/` migrations in the PR; Supabase workflow must pass before merge.
- Avoid double production deploys: Netlify UI “build on push” should stay off if GitHub Actions deploys (see [.cursor/rules/netlify-mcp.mdc](.cursor/rules/netlify-mcp.mdc)).

Run locally before pushing portal changes:

```bash
pnpm install
pnpm --filter @crypto-pay/portal typecheck
```

---

## Protected areas (coordinate first)

| Area | Why |
|------|-----|
| `supabase/migrations/` | Applied to production on merge to `master` |
| `.github/workflows/` | Changes CI/CD behavior for everyone |
| Repo/org secrets | Netlify, Supabase, Porkbun — admin-only |
| `netlify.toml`, DNS scripts | Affects `cryptopay.sale` hosting |

For breaking or wide refactors, propose in the PR or an issue before large diffs.

---

## After merge

- Delete the feature branch on GitHub (or locally).
- Pull latest `master` for your next branch: `git pull origin master`.
- Watch the Actions tab if you changed deploy- or migration-affecting paths.

---

## AI agents and automation

- **Humans:** this file + [README.md](README.md).
- **Cursor / Copilot:** [.github/copilot-instructions.md](.github/copilot-instructions.md) (architecture, stack, token-efficiency rules — not a substitute for Git hygiene above).

Agents should follow the same branch/PR flow and must not commit secrets or add unsolicited markdown beyond what maintainers request.
