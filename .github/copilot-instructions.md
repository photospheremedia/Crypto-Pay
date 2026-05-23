---
applyTo: '**'
description: 'Comprehensive AI coding agent instructions for Restaurant Hub Solution multi-tenant SaaS platform'
---

## 📌 Welcome, GitHub Copilot Users!

This file guides all Copilot interactions in this workspace. **Key points:**

- ✅ This file is **automatically loaded** for all code generation
- ✅ VS Code settings are configured in `.vscode/settings.json`
- ✅ **Chat shortcuts & examples**: See [.github/COPILOT_GUIDE.md](./COPILOT_GUIDE.md)
- ✅ **Focus on implementation** - Don't generate documentation or audit reports
- ✅ **Always research online** before building custom solutions

---

## 🎯 CRITICAL: Token Efficiency Rules (Read First)

**These rules prevent wasteful AI behavior and resource waste:**

1. **NO unnecessary markdown files** - Do NOT create documentation, summaries, or audit reports unless explicitly requested
2. **Implement code only** - Focus entirely on code changes, not documentation about changes
3. **Read instructions incrementally** - Only expand to detailed sections when needed for specific tasks
4. **Reference existing docs** - Link to `/docs/` instead of duplicating information
5. **Propose before major changes** - Brief message only, don't create design documents

**Token Waste Pattern to Avoid:**
- ❌ User asks for feature → Agent creates 5 markdown files explaining approach
- ❌ User finds issue → Agent creates audit report + implementation plan document  
- ❌ User requests refactor → Agent generates analysis + refactoring guide + summary

**Correct Pattern:**
- ✅ User asks for feature → Agent implements code directly
- ✅ User finds issue → Agent fixes code or proposes brief fix (2-3 sentences)
- ✅ User requests refactor → Agent implements refactor or proposes brief approach

---

## 🎯 Business Overview

**Restaurant Hub Solution** is a **B2B SaaS platform** serving modern restaurant groups, dark kitchens, and multi-location restaurants with an all-in-one operations suite.

### Market Position
- **Target Market**: Multi-location restaurant groups, delivery-focused concepts (dark kitchens), independent restaurants
- **Problem We Solve**: Restaurant operators struggle with fragmented systems—managing orders across 10+ delivery platforms, coordinating supplies, and scaling operations without staff overhead
- **Our Solution**: Single unified dashboard + supply marketplace + technology integrations (delivery, POS, analytics)

### Core Value Propositions

#### 1. **Delivery Platform Consolidation** (Urban Piper Reselling)
- Integrate 15+ delivery platforms (Uber Eats, DoorDash, Grubhub, Talabat, Seamless, etc.) into one dashboard
- No more context switching between apps—all orders on one tablet
- Automated menu sync, real-time inventory, unified reporting
- **Revenue Model**: $99-$199/mo subscription + $199-$499 setup fees (40-60% margin)

#### 2. **Supply Chain Management** (Internal B2B Marketplace)
- Direct ordering from distributors and suppliers
- Real-time pricing, inventory tracking, automated reorders
- Multi-location purchasing power and bulk discounts
- Commission-based revenue from supplier partnerships

#### 3. **Technology Stack as Service**
- Branded storefront for direct customer orders (0% commission vs 30% on delivery apps)
- AI-powered customer service chatbot (reduces support costs)
- Analytics and business intelligence (prep times, peak hours, profitability by item)
- POS integration for seamless operations
- **Revenue**: Per-feature subscriptions, enterprise custom pricing

### Business Model

**Three-Tier Revenue Structure:**

| Tier | Customer Type | Services | Monthly | Setup | Margin |
|------|---------------|----------|---------|-------|--------|
| **Basic** | Single location, small chains | Delivery integration, basic analytics | $99 | $199 | ~40% |
| **Pro** | Growing chains (3-10 locations) | Everything in Basic + advanced analytics, multi-location, API access | $199 | $299 | ~40% |
| **Enterprise** | Large chains (10+ locations) | Custom integrations, dedicated support, SLA, on-site training | Custom | $499+ | 60%+ |

**Additional Revenue Streams:**
- Supply marketplace commissions (3-5% from suppliers)
- Payment processing fees (Stripe integration)
- Premium AI features (advanced chatbot training)
- White-label/reseller partnerships

### Customer Segments & Solutions

**1. Dark Kitchen Operators**
- Multi-brand management (run 3-5 virtual brands from one kitchen)
- Optimized prep times and packaging per brand
- Real-time capacity planning across brands
- Delivery-only, no dine-in overhead

**2. Multi-Location Chains**
- Centralized menu management across locations
- Per-location customization (pricing, inventory, hours)
- Unified analytics dashboard
- Role-based access (corporate oversight + manager autonomy)

**3. Independent Restaurants**
- Compete with chains by reducing operational friction
- Direct-to-customer ordering (keep commission)
- Professional branding and online presence
- AI chatbot for customer service

### Competitive Advantages

✅ **All-in-one** - Delivery + supply + operations + AI support (competitors do 1-2)
✅ **White-glove onboarding** - We handle technical setup, customers focus on business
✅ **Local support** - Direct access to our team (vs auto-reply support at competitors)
✅ **Transparent pricing** - Fixed fees, no surprise charges
✅ **Scalability** - Same solution works for 1-location indie or 50-location chain
✅ **API-first** - Easy custom integrations for enterprise customers

### Success Metrics (North Star)

- **Customer Acquisition**: Target 100+ SMB restaurants in Year 1
- **Delivery Integration Adoption**: 70%+ of customers using Urban Piper integration
- **Retention**: 85%+ annual retention (sticky through workflow integration)
- **ARPU Growth**: Upsell from Basic → Pro as customers scale
- **Marketplace Adoption**: 50%+ of customers purchasing supplies through platform

### Strategic Partnerships

- **Urban Piper**: Delivery platform aggregator (resell their service)
- **Stripe**: Payment processing integration
- **Supabase**: Backend infrastructure (auth, database, edge functions)
- **Potential**: POS integrations (Toast, Square), accounting software (QuickBooks)

---

## 📚 Documentation System

**Critical Principle**: Documentation must be **strictly non-redundant** and organized in a single source of truth.

### 🔧 VS Code Native Environment

You are working in a **VS Code environment** with access to native tools. Always search for the most native workflow first before doing things manually:

**Native VS Code Capabilities:**
- **Built-in Search** (`Cmd+Shift+F`) - Search across entire workspace, use regex patterns
- **File Explorer** - Navigate files and folders intuitively
- **Integrated Terminal** - Run commands without switching contexts
- **Go to Definition** (`Cmd+Click` or `Cmd+F12`) - Jump to function/class definitions
- **Find References** (`Shift+F12`) - See all usages of a symbol
- **Command Palette** (`Cmd+Shift+P`) - Access all VS Code commands
- **Source Control** - Git operations built-in without terminal
- **Problems Panel** - See all errors, warnings, linting issues at once
- **Extensions** - Leverage installed extensions (Supabase, Tailwind, TypeScript, etc.)

**When you need to:**
- **Find code patterns** → Use `Cmd+Shift+F` with regex instead of manual grep
- **Locate all usages** → Use `Shift+F12` instead of searching manually
- **Navigate to definition** → Use `Cmd+F12` instead of opening files manually
- **Run commands** → Use integrated terminal instead of opening separate shell
- **Check errors** → Use Problems panel instead of running linters manually
- **View git history** → Use Source Control panel instead of git commands

**Rule**: If VS Code has a native feature for the task, use it first. Only use terminal/CLI for operations that require shell scripts or external tools (Supabase CLI, Vercel CLI, etc.).

### 🌐 Online Research & Documentation Lookup

You have access to fetch and research online whenever needed:

**When to Research Online:**
- Need to understand a library's best practices
- Looking for official documentation (Tailwind, React, Next.js, Supabase, etc.)
- Want to verify current syntax or API usage
- Investigating error messages or warnings
- Finding performance benchmarks or patterns
- Checking if a native feature already exists

**How to Research:**
- Use official documentation URLs directly (React docs, Next.js docs, Supabase docs, etc.)
- Fetch web pages for current, authoritative information
- Reference research in your code decisions and proposals
- Always prefer official docs over blog posts or Stack Overflow

**Examples of Research You Should Do:**
- "Before implementing a data table, check Next.js best practices"
- "Look up Tailwind v4 features before deciding on styling approach"
- "Check Supabase docs to see if a feature exists natively"
- "Verify PostgreSQL index strategy for multi-tenant queries"
- "Research React form handling patterns for async validation"

**Rule**: Don't guess or assume - if you need to know how something works, research it online using official sources. This prevents building on outdated assumptions.

### Where Documentation Lives

All substantive documentation belongs in **`/docs`** directory:
- `docs/SETUP.md` - Local development setup
- `docs/DEPLOYMENT.md` - Deployment procedures
- `docs/DATABASE.md` - Database schema and migrations
- `docs/EMAIL_SETUP.md` - Email system configuration
- `docs/SECURITY.md` - Security policies and practices
- `docs/URBAN_PIPER_INTEGRATION.md` - Delivery integration guide

### Documentation vs Code Comments

**Code comments** (in `.ts`, `.tsx`, `.js` files):
- ✅ Explain WHY, not WHAT (WHAT is obvious from code)
- ✅ Clarify non-obvious business logic or edge cases
- ✅ Reference related docs: "See `/docs/DATABASE.md#migrations`"
- ✅ Keep comments short and close to code

**Documentation files** (in `/docs`):
- ✅ High-level guides and procedures
- ✅ Setup instructions and configuration
- ✅ Architecture decisions and rationales
- ✅ Step-by-step workflows
- ✅ Troubleshooting guides

**What NOT to do:**
- ❌ Duplicate setup instructions in README and docs
- ❌ Comment every line of obvious code
- ❌ Document the same process in multiple files
- ❌ Keep outdated guides alongside new ones

### DRY Documentation Rules

1. **Single Source of Truth**: If information exists in `/docs`, don't repeat it elsewhere
2. **Cross-Reference**: Link to `/docs` files instead of duplicating content
   ```markdown
   # README.md
   For detailed setup instructions, see [docs/SETUP.md](../docs/SETUP.md)
   ```

3. **Update One Place**: When information changes, update the `/docs` file
   - Update related code comments to reference the doc
   - Don't update multiple duplicate copies

4. **Archive Old Docs**: When docs become outdated:
   - Don't leave them in `/docs` alongside new ones
   - Move to a `docs/archive/` folder with datestamp
   - Update cross-references to point to new docs

### When to Create New Documentation

**Create `/docs/FEATURE_NAME.md` when:**
- Feature spans multiple files/systems
- Setup or configuration is needed
- Multiple developers need to understand it
- Procedure is non-obvious or multi-step

**Don't create docs for:**
- Simple functions (document in code comments instead)
- Obvious patterns (seen elsewhere in codebase)
- One-time setup (reference existing setup docs)
- Anything already documented elsewhere

### Documentation Maintenance

**Before writing new docs:**
1. Search `/docs/` - Is this documented elsewhere?
2. Search code comments - Is this explained inline?
3. Check this instructions file - Is this already covered?
4. If found, reference it instead of duplicating

**Outdated docs are worse than no docs** - they send developers in wrong directions.

---

## Architecture Overview

**Monorepo Structure** using pnpm workspaces:
- `apps/portal` - Next.js 16 main application (marketing + customer account + admin control plane)
- `apps/storefront` - Optional demo storefront (mock data mode)
- `packages/db` - Supabase client factories (`getSupabaseServerClient`, `getSupabaseBrowserClient`, `getSupabaseServiceClient`)
- `packages/shared` - Shared types, constants, and utilities (roles, tenant types)

### ⚠️ Next.js 16: No Middleware

**IMPORTANT**: `middleware.ts` is **deprecated** in Next.js 16. Do NOT create middleware files.

- Route protection is handled via **Supabase RLS** (database level) and **server-side auth checks**
- If edge logic is needed, use `proxy.ts` instead (Next.js 16 convention)
- Cloudflare proxy handles edge protection for production

## Multi-Tenancy & Auth

This is a **multi-tenant SaaS platform**. Key patterns:

```typescript
// Server-side tenant context resolution (apps/portal/lib/tenant-context.ts)
const ctx = await resolveTenantContext(slug); // Returns { userId, tenant, membership }

// Role hierarchy: rhs_admin > admin > owner > manager > staff
// See apps/portal/lib/admin-auth.ts for ROLE_PERMISSIONS
```

**Supabase RLS** enforces tenant isolation via helper functions in migrations:
- `is_member_of_tenant(tenant_id)` - Check membership
- `has_tenant_role(tenant_id, roles[])` - Check role-based access

### RLS & Security Best Practices

**SECURITY DEFINER Functions** - Always set `search_path = ''`:
```sql
-- ✅ CORRECT: Prevents schema-based attacks
create or replace function is_member_of_tenant(tenant_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''  -- CRITICAL: Prevents unauthorized schema access
as $$
begin
  return exists (
    select 1 from public.tenant_memberships 
    where auth.uid() = user_id and tenant_memberships.tenant_id = $1
  );
end;
$$;

-- ❌ WRONG: Missing search_path exposes to injection attacks
create function has_role() returns boolean
language plpgsql security definer
as $$ ... $$;  -- Vulnerable!
```

**RLS Policies** - Always specify target role with `TO`:
```sql
-- ✅ CORRECT: Only evaluated for authenticated users (faster + secure)
create policy "Users can access own records" on data_table
to authenticated
using ( (select auth.uid()) = user_id );

-- ⚠️ SUBOPTIMAL: Evaluated for all roles including anon
create policy "Users can access own records" on data_table
using ( auth.uid() = user_id );
```

**Performance Tip:** Wrap `auth.uid()` in `SELECT` for optimizer caching:
```sql
-- ✅ Optimizer can cache auth.uid() result
using ( (select auth.uid()) = user_id )

-- ⚠️ Called for every row evaluation
using ( auth.uid() = user_id )
```

## Supabase Client Usage

Two patterns exist - **use the correct one**:

```typescript
// For most API routes and server components - uses @crypto-pay/db
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
const supabase = await getSupabaseServerClient();

// For apps/portal internal lib (legacy) - uses local @/lib/supabase/server
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

Service role client (bypasses RLS) - **use sparingly**:
```typescript
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
```

### ⚠️ Auth Methods: getClaims() vs getUser() vs getSession()

**Prefer `getClaims()` for performance** - uses cached JWKS, verifies JWT locally:
```typescript
// ✅ PREFERRED: Fast, cached JWKS verification (no network request with asymmetric keys)
const { data, error } = await supabase.auth.getClaims();
// Returns: { sub, email, aud, exp, iat, app_metadata, user_metadata }

// ✅ GOOD: When you need full user object (always hits Auth server)
const { data: { user } } = await supabase.auth.getUser();

// ⚠️ LOW-LEVEL: Only for session tokens, NOT for security-sensitive operations
const { data: { session } } = await supabase.auth.getSession();
```

**Why `getClaims()` is preferred:**
- Uses cached JWKS endpoint (`/.well-known/jwks.json`) - significantly faster
- For asymmetric JWT keys (ECC/RSA): Verifies locally via WebCrypto API (no network)
- For symmetric keys: Falls back to server verification (like `getUser()`)
- Auto-refreshes session if token is about to expire
- Returns same claims as JWT, customizable via Custom Access Token Hook

**When to use each:**
| Method | Use Case | Performance |
|--------|----------|-------------|
| `getClaims()` | Most auth checks, middleware, API routes | ⚡ Fastest (cached) |
| `getUser()` | Need full user object, profile data | 🔄 Network request |
| `getSession()` | Low-level session access only | ⚠️ Not for security |

### PKCE Flow (Default for OAuth)

PKCE is now the default authentication flow for OAuth:
```typescript
// Exchange authorization code for session (PKCE flow)
await supabase.auth.exchangeCodeForSession('auth-code-from-callback');
```

## ⚠️ IMPORTANT: Always Check Supabase Official Docs First

Before implementing any Supabase feature, **always check the official Supabase documentation** to see if it's already available as a native feature:

### 📚 Essential Supabase Resources
- **[Supabase Guides](https://supabase.com/docs/guides/)** - Official feature documentation
- **[Storage Overview](https://supabase.com/docs/guides/storage/)** - File storage, buckets, RLS
- **[Vector Buckets](https://supabase.com/docs/guides/storage/vector/creating-vector-buckets)** - Vector storage for embeddings & semantic search (Alpha)
- **[Analytics Buckets](https://supabase.com/docs/guides/storage/analytics/creating-analytics-buckets)** - Apache Iceberg tables for analytics data (Private Alpha)
- **[Vector Indexes](https://supabase.com/docs/guides/storage/vector/working-with-indexes)** - Search optimization

### Supabase Storage Bucket Types

Supabase offers **three distinct bucket types**, each optimized for different use cases.

#### Current Implementation in Restaurant Hub Solution

**Standard Buckets** (Files & Assets):
- `avatars` - User profile photos (public, 5MB limit)
- `product-images` - Product catalog images (public, 5MB limit)
- `email-attachments` - Invoices, quotes, receipts (private, 10MB limit)
- `import-export` - CSV data imports/exports (private, 50MB limit)
- `invoices`, `import-files`, `exports` - Supporting document storage

**Vector Bucket** (Embeddings) - Alpha:
- `vectors` - For AI embeddings and semantic search (e.g., chat memory, RAG patterns)

**Analytics Bucket** (Apache Iceberg) - Private Alpha:
- `analytics` - For event tracking and time-series data

---

#### 1. **Standard Storage Buckets** (Files & Assets)
```typescript
// For regular files: images, documents, videos, etc.
import { uploadAvatar, deleteAvatar } from '@/lib/storage';

// Upload avatar
const result = await uploadAvatar(file);
// → Automatically updates user_profiles.avatar_url via trigger

// Delete avatar
await deleteAvatar();
// → Automatically clears user_profiles.avatar_url via trigger

// Get public URL
const { publicUrl } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);
```
**Current Usage:** User avatars, product images, document storage
**Key Implementation:** See `apps/portal/lib/storage.ts`

#### 2. **Vector Buckets** (Embeddings & Semantic Search) - **Alpha Feature**
```typescript
// For AI embeddings and similarity search (currently in bucket but needs proper API)
// When implementing:

const vectors = supabase.storage.vectors;

// Create index (one-time setup)
await vectors.createIndex('vectors', {
  indexName: 'chat-embeddings-openai',
  dimension: 1536, // OpenAI text-embedding-3-small
  distanceMetric: 'cosine'
});

// Store embeddings
await vectors.from('vectors').upsert([
  {
    id: `chat_${conversationId}_${messageId}`,
    vector: embeddingArray, // 1536 dimensions from OpenAI
    metadata: {
      conversation_id: conversationId,
      message_id: messageId,
      text_content: messageText,
      created_at: new Date().toISOString()
    }
  }
]);

// Search similar messages
const results = await vectors.from('vectors').search(queryEmbedding, {
  limit: 5,
  matchThreshold: 0.7
});
```
**Planned Use for:** 
- Chat memory and context storage
- Semantic search across conversations
- RAG (Retrieval-Augmented Generation) for customer context
- Low-cost vector search alternative to dedicated vector databases

**Key Limits:**
- Max 10 indexes per bucket
- Max 500 vectors per batch operation
- Dimension must match embedding model (1536 for OpenAI)
- Currently not implemented - ready for implementation when chat context feature is needed

#### 3. **Analytics Buckets** (Apache Iceberg Tables) - **Private Alpha**
```typescript
// For large-scale analytics data (currently in bucket but needs proper API)
// When implementing:

const analytics = supabase.storage.analytics;

// Create analytics bucket (one-time)
await analytics.createBucket('analytics');

// Insert event data (via Iceberg format)
await analytics.from('analytics').insert([
  {
    event_id: generateUUID(),
    event_type: 'order_placed',
    tenant_id: tenantId,
    user_id: userId,
    timestamp: new Date().toISOString(),
    data: {
      order_id: orderId,
      total_amount: amount,
      item_count: items.length
    }
  }
]);

// Query via Postgres FDW (Iceberg is queryable as Postgres table)
const stats = await supabase
  .from('analytics_table') // Iceberg table mapped to Postgres
  .select('event_type, count(*), avg(data->total_amount)')
  .group_by('event_type');
```
**Planned Use for:**
- Event tracking and analytics
- Time-series data storage (order volume, revenue trends)
- Real-time replication from Postgres
- Cost-effective analytics data warehouse

**Key Features:**
- Apache Iceberg open-table format
- Queryable via Postgres Foreign Data Wrapper
- Real-time sync from database tables
- Compatible with Spark, PyIceberg, DuckDB
- Currently not implemented - ready for implementation when event tracking feature is needed

### Examples of Features Already Available
- ✅ Vector embeddings (pgvector + vector buckets)
- ✅ Analytics buckets (Apache Iceberg tables)
- ✅ Full-text search (PostgreSQL FTS)
- ✅ Real-time subscriptions (WebSocket)
- ✅ Edge functions (Deno runtime)
- ✅ Row Level Security (RLS)
- ✅ Multi-tenant isolation patterns
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ File storage with RLS (standard buckets)

**Rule:** If you're about to build something custom, spend 2 minutes checking if Supabase already offers it natively.

## Key Commands

```bash
pnpm install                    # Install all dependencies
pnpm dev:portal                 # Run portal on localhost:3001
pnpm db:types                   # Regenerate database.types.ts from Supabase
pnpm db:push                    # Push schema changes to Supabase
pnpm build:portal               # Production build
```

## Route Organization (apps/portal/app)

- `(marketing)/` - Public pages (pricing, services, about, contact)
- `(login)/`, `(signup)/` - Auth flows
- `account/` - Customer dashboard (orders, quotes, settings, security)
- `admin/` - Internal control plane (products, orders, leads, analytics)
- `api/` - API routes organized by domain (chat, orders, products, team, etc.)

## 🏛️ Design Principles

**Core Architectural Principles:**

1. **Single Responsibility Principle** - Each component, function, and service has one reason to change
   - Database models handle data persistence only
   - API routes handle request/response only
   - Components handle UI rendering only

2. **DRY (Don't Repeat Yourself)** - Reusable code, patterns, and utilities
   - Extract shared logic into utilities
   - Create reusable components instead of copy-pasting
   - Document once in `/docs`, reference everywhere

3. **Domain-Driven Design** - Organize code around business domains
   - `/api/orders/*` for order management
   - `/api/products/*` for product catalog
   - `/api/team/*` for team/staff management
   - Keep domains independent and decoupled

4. **Clean Code** - Readable, maintainable, self-documenting code
   - Meaningful variable and function names
   - Small functions with clear intent
   - Comments explain WHY, not WHAT
   - Avoid clever tricks in favor of clarity

5. **YAGNI (You Aren't Gonna Need It)** - Build what's needed, not what might be needed
   - Don't over-architect for hypothetical future use cases
   - Keep it simple until complexity is proven necessary
   - Premature optimization is the enemy

6. **Multi-Tenant First** - All features must respect tenant isolation
   - RLS policies on every table
   - Tenant ID checks on API routes
   - No cross-tenant data leakage
   - Document multi-tenant considerations

## UI & Performance Architecture

**Critical Principle**: UI excellence requires matching performance in APIs and database queries.

### UI Development Standards

Uses **Radix UI primitives** with **class-variance-authority (cva)** for variants:

```typescript
// Example: apps/portal/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
const buttonVariants = cva("...", { variants: { variant: {...}, size: {...} } });
```

Styling: **Tailwind CSS v4** with `tw-animate-css` for animations.

### 🔍 Research & Best Practices

**Before implementing UI features or API endpoints:**

1. **Research Online** - Look up best practices for:
   - Component patterns (React, form handling, data tables, real-time updates)
   - API design (REST conventions, pagination, filtering, sorting)
   - Database optimization (indexing strategies, query patterns, denormalization)
   - Performance benchmarks (response times, bundle sizes, Core Web Vitals)

2. **Adapt to Our Stack** - Consider:
   - Multi-tenant constraints (RLS, tenant isolation)
   - Supabase capabilities (edge functions, real-time, triggers)
   - Next.js patterns (server/client components, edge runtime)
   - Our existing patterns (see similar features already implemented)

3. **Example Search Queries:**
   - "Next.js data table with server-side sorting and filtering best practices"
   - "PostgreSQL indexing strategy for multi-tenant queries"
   - "React form handling with async validation patterns"
   - "Supabase real-time subscriptions performance optimization"

### ⚠️ Refactoring & Breaking Changes

**When you discover architectural issues:**

- **Minor improvements** (within scope) - Implement directly
- **Moderate optimizations** (new pattern) - Suggest approach and wait for approval
- **Major refactoring** (breaking changes, schema redesign) - **ALWAYS STOP AND PROPOSE FIRST**

**Refactoring Proposal:** Brief inline message with issue + proposed fix + research link. Do NOT create summary documents.

**Approval Workflow:**
1. Identify issue → 2. Brief proposal message → 3. Wait for user feedback → 4. Implement approved changes

**Do NOT:**
- ❌ Refactor without permission
- ❌ Merge multiple concerns (UI + schema changes in one PR)
- ❌ Create markdown files documenting refactoring plans
- ❌ Generate summary documents or audit reports
- ❌ Implement custom solutions when better alternatives exist

**DO:**
- ✅ Research alternatives before proposing
- ✅ Keep proposals brief and focused
- ✅ Implement code changes, not documentation changes (unless requested)
- ✅ Ask for approval on major changes
- ✅ Implement within approved scope

## 🧪 Testing Strategy

**Testing Pyramid (from base to top):**

1. **Unit Tests** - Test functions and utilities in isolation
   - Test business logic, utilities, helpers
   - Fast to run, focused on single concerns
   - Location: `src/__tests__/utils.test.ts` or colocated

2. **Integration Tests** - Test components and features together
   - Test API routes with actual database calls
   - Test React components with user interactions
   - Test RLS policies and data isolation

3. **E2E Tests** - Full user workflows end-to-end
   - Playwright tests in `apps/portal/tests/`
   - Authentication flows, form submissions, multi-step workflows
   - Run against real deployment (staging/production)

**Coverage Goals:**
- Critical business logic: 80%+ coverage
- API routes: 70%+ coverage
- Components: 60%+ coverage
- Utilities: 90%+ coverage

**When Writing Tests:**
- Test behavior, not implementation
- Make tests independent and repeatable
- Use descriptive test names: `should_fail_with_invalid_email`
- Test happy path AND error cases
- Mock external dependencies (APIs, services)

## 📋 Code Style & Formatting

**TypeScript & JavaScript Standards:**

```typescript
// ✅ GOOD: Meaningful names, clear intent
function calculateMonthlyRevenue(orders: Order[], month: number): number {
  return orders
    .filter(order => order.month === month)
    .reduce((sum, order) => sum + order.total, 0);
}

// ❌ BAD: Unclear names, vague intent
function calc(o, m) {
  return o.filter(x => x.m === m).reduce((s, x) => s + x.t, 0);
}
```

**Code Style Rules:**
- **Line Length**: Max 100 characters (readability)
- **Indentation**: 2 spaces (consistent with codebase)
- **Quotes**: Double quotes for strings
- **Semicolons**: Always (TypeScript enforces)
- **Arrow Functions**: Prefer for callbacks
- **Const/Let**: Never use `var`
- **Type Annotations**: Always (strict TypeScript mode)

**Formatting Tools:**
- **Prettier**: Auto-formats code (configured in `prettier.config.js`)
- **ESLint**: Catches errors and style issues (`.eslintrc.json`)
- **Tailwind**: CSS class ordering via `tailwind-plugin-prettier`

**Naming Conventions:**
```typescript
// Components: PascalCase
function UserProfileCard() { }

// Functions/variables: camelCase
function calculateTotalPrice() { }
const totalOrders = 42;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880;
const API_TIMEOUT = 30000;

// Database columns: snake_case
user_id, created_at, is_active

// Types/Interfaces: PascalCase
interface UserProfile { }
type OrderStatus = 'pending' | 'complete';
```

## 🔄 Git & PR Workflow

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, missing semicolons)
- `refactor:` - Code refactoring without changing functionality
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build, dependencies, tooling

**Examples:**
```
feat: Add customer pricing tier management

Implement pricing tiers for different customer segments.
Adds UI for tier selection and calculates discounts based on tier.

Fixes #123
```

```
fix: Correct RLS policy on orders table

Previously allowed staff to view all tenant orders.
Now restricts to own tenant only via RLS policy.

Closes #456
```

**PR Guidelines:**
- **One concern per PR** - Don't mix features, refactors, and docs
- **Atomic commits** - Each commit is a working state
- **Reference issues** - Use `Fixes #123` or `Closes #456`
- **Write good descriptions** - Explain WHAT and WHY
- **Keep PRs small** - Easier to review, easier to debug
- **Request review** - Get approval before merging
- **Pass all checks** - Tests, lint, type checks must pass

## ⚡ Performance Budgets

**Don't Create Documentation Files Unless Explicitly Requested**

This is the root cause of inefficient AI agent behavior. **Only implement code changes.** Do not:
- ❌ Create new markdown files to document changes
- ❌ Generate summary files, audit reports, or analysis documents  
- ❌ Write documentation about what you're doing
- ❌ Create planning or design documents
- ❌ Generate README updates or CHANGELOG entries
- ❌ Build implementation guides or runbooks

**Only create documentation when:**
- ✅ User explicitly asks: "Create a guide for..."
- ✅ File is required by project structure (e.g., `/docs/FEATURE.md` already exists and needs updating)
- ✅ User says: "Document this in..."

**Why:** Every markdown file creation wastes tokens, storage, and maintenance burden. Code changes are self-documenting when well-structured.

---

### Frontend Performance Targets:

| Metric | Target | Tool |
|--------|--------|------|
| **First Contentful Paint (FCP)** | < 1.8s | Lighthouse, Web Vitals |
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse, Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse, Web Vitals |
| **Time to Interactive (TTI)** | < 3.8s | Lighthouse |
| **Bundle Size (Main)** | < 250KB gzipped | Bundleanalyzer |
| **JavaScript Size** | < 150KB gzipped | Bundleanalyzer |
| **CSS Size** | < 50KB gzipped | Bundleanalyzer |

**API Performance Targets:**

| Endpoint | Target | Scope |
|----------|--------|-------|
| **Auth endpoints** | < 200ms | Login, signup, password reset |
| **Data fetches** | < 300ms | Orders, products, customers |
| **List endpoints** | < 500ms | With pagination (default 20 items) |
| **Search endpoints** | < 800ms | Full-text search queries |
| **Analytical queries** | < 2s | Complex aggregations, reports |

**Database Performance Targets:**

| Operation | Target | Notes |
|-----------|--------|-------|
| **Single row select** | < 10ms | By primary key |
| **Filtered list** | < 50ms | With proper indexes |
| **Join queries** | < 100ms | Multi-table queries |
| **Aggregations** | < 200ms | COUNT, SUM, GROUP BY |

**How to Monitor:**
- Chrome DevTools Network tab (local development)
- Lighthouse audit (every major feature)
- Vercel Analytics (production monitoring)
- Supabase query logs (database performance)
- New Relic / Datadog (if integrated)

**When to Optimize:**
1. If any metric exceeds target, investigate root cause
2. Profile with DevTools before optimizing
3. Measure impact after optimization
4. Document optimization in code comments
5. Add performance regression tests

## AI Chat Integration

Chat API at `apps/portal/app/api/chat/route.ts`:
- Uses `@ai-sdk/groq` and `@ai-sdk/openai` directly (AI SDK v6)
- Supports lead capture for guests
- Context-aware personalization based on auth state
- Returns `toUIMessageStreamResponse()` for `useChat` hook compatibility

**AI SDK v6 Key Patterns:**
```typescript
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Create provider
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

// Stream text (note: maxOutputTokens, NOT maxTokens)
const result = streamText({
  model: groq('llama-3.3-70b-versatile'),
  system: 'System prompt here',
  messages: simpleMessages, // {role, content}[] format
  temperature: 0.7,
  maxOutputTokens: 1000, // ⚠️ Changed from maxTokens in v5.0+
});

// Return UI stream format (required for useChat hook)
return result.toUIMessageStreamResponse();
```

**Message Format Conversion (UI → Model):**
```typescript
// AI SDK UI format: {role, parts: [{type, text}]}
// Model format: {role, content}
const simpleMessages = messages.map((msg: any) => ({
  role: msg.role as 'user' | 'assistant' | 'system',
  content: msg.parts?.map((p: any) => p.text).join('') || msg.content || '',
}));
```

**Current AI Models:**
- Groq: `llama-3.3-70b-versatile` (primary, free tier)
- OpenAI: `gpt-4o-mini` (fallback)
- Check [Groq models docs](https://console.groq.com/docs/models) before changing - models get deprecated

**Edge Function Configuration (`supabase/config.toml`):**
```toml
[functions.chat]
verify_jwt = false  # Required for guest/anonymous access

[functions.rate-limit-check]
verify_jwt = false  # Required for public rate limiting
```

**Edge Functions with RLS Enforcement:**
```typescript
// In Edge Function: Pass Authorization header to enforce RLS
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
  {
    global: {
      headers: { Authorization: req.headers.get('Authorization')! }
    }
  }
);

// Now RLS policies are automatically enforced based on user's JWT
const { data } = await supabase.from('my_table').select('*');
```

**Important**: Supabase edge functions require JWT auth by default. Set `verify_jwt = false` for public endpoints (chat, webhooks). Without this, guests get 401 errors

## Database Migrations

Sequential migrations in `supabase/migrations/`:
1. `0001_tenants.sql` - Core tenant/membership tables + RLS helpers
2. `0002_core.sql` onwards - Features (products, orders, leads, etc.)

**Never modify existing migrations** - create new ones with timestamp prefix.

## Environment Variables

**One place to store environment variables for local development:**

### **`apps/portal/.env.local`** ⭐ LOCAL DEVELOPMENT ONLY
   - Your local machine configuration
   - **Create it from `apps/portal/.env.example`**: `cp apps/portal/.env.example apps/portal/.env.local`
   - Gitignored (never committed)
   - Update with your actual keys and secrets

**To populate from production** (for testing):
```bash
pnpm vercel:env    # Pulls Vercel environment variables into .env.local
```

**For Edge Functions secrets:**
Use Supabase Secrets Vault:
```bash
supabase secrets set KEY=value
supabase secrets list
```

**Required variables for development** (in `apps/portal/.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `GROQ_API_KEY` or `OPENAI_API_KEY` (optional)

**Note:** Vercel stores encrypted secrets in their dashboard. Supabase has its own vault for Edge Functions secrets.

## Urban Piper Integration (Delivery Services)

Restaurant Hub resells Urban Piper delivery integration services:
- Types defined in `types/urban-piper.ts`
- Three tiers: `basic`, `pro`, `enterprise` with Hub and Meraki services
- Platforms: UberEats, DoorDash, Grubhub, Postmates, Seamless, Caviar

```typescript
// Service structure (types/urban-piper.ts)
export type UrbanPiperPlan = 'basic' | 'pro' | 'enterprise';
export type DeliveryPlatform = 'ubereats' | 'doordash' | 'grubhub' | 'postmates' | 'seamless' | 'caviar' | 'direct';
```

## Email System

Uses **Resend** for transactional email (`apps/portal/lib/email/`):

```typescript
import { sendEmail } from '@/lib/email/sender';

await sendEmail({
  to: { email: 'user@example.com', name: 'User' },
  subject: 'Welcome!',
  template: 'welcome',
  templateData: { firstName: 'John', dashboardUrl: '...' }
});
```

Templates: `welcome`, `order_confirmation`, `subscription_renewal`, `abandoned_cart`, `reengagement`, `promotional`

Environment: `RESEND_API_KEY` (logs to console in dev if missing)

## Infrastructure & Services Architecture

### Complete Service Stack

**Multi-layer architecture with specialized services:**

```
┌─ Frontend (Next.js 16.1.6) ──────────────────────────────┐
│                                                           │
│  ✅ React 19 Client Components                          │
│  ✅ Radix UI + Tailwind CSS v4                          │
│  ✅ Lucide Icons (20+)                                  │
│  ✅ TypeScript 5+ strict mode                           │
│  ✅ Zustand state management                            │
│                                                           │
└─────────────────┬─────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
    ┌─────────────────────────────────────────────────────┐
    │     Supabase Edge Functions (Global CDN)            │
    │                                                     │
    │  🔸 verify-turnstile      → Cloudflare (15ms)      │
    │  🔸 send-email            → Resend (50ms)          │
    │  🔸 rate-limit-check      → Upstash Redis (12ms)   │
    │  🔸 stripe-webhook        → Stripe events          │
    │  🔸 urban-piper-webhook   → Urban Piper events     │
    │  🔸 chat                  → Groq/OpenAI (300ms)    │
    │                                                     │
    └────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┴───────────────────────────────────────┐
    │                                                    │
    ↓                                                    ↓
┌─────────────────────────────────┐  ┌──────────────────────┐
│  Supabase (PostgreSQL + Auth)   │  │  External Services   │
│                                 │  │                      │
│  ✅ Multi-tenant database       │  │  ✅ Resend Email    │
│  ✅ Row Level Security (RLS)    │  │  ✅ Cloudflare CDN  │
│  ✅ Realtime subscriptions      │  │  ✅ Stripe Payments │
│  ✅ Storage Buckets (avatars,   │  │  ✅ Upstash Redis   │
│     product images, documents)  │  │  ✅ Urban Piper API │
│  ✅ Auth (OAuth + password)     │  │  ✅ Groq/OpenAI AI  │
│  ✅ Stored procedures & triggers│  │  ✅ Vercel hosting  │
│                                 │  │                      │
└─────────────────────────────────┘  └──────────────────────┘
```

---

### 🔐 User Roles & Multi-Tenancy

**Three-tier user system with strict permission hierarchy:**

```typescript
// Role Hierarchy (highest → lowest privileges)
type AdminRole = 'rhs_admin' | 'admin' | 'owner' | 'manager' | 'staff';
type UserRole = AdminRole | 'user';

// Permissions by role (apps/portal/lib/admin-auth.ts)
ROLE_PERMISSIONS = {
  'rhs_admin':  { canManageTenants, canViewAnalytics, canIssueRefunds, ... },
  'admin':      { canViewProducts, canManageOrders, canViewTeam, ... },
  'owner':      { canViewOwnData, canInviteStaff, canAccessSettings, ... },
  'manager':    { canProcessOrders, canViewReports, canManageInventory, ... },
  'staff':      { canProcessOrders, canViewProducts, ... },
  'user':       { canPlaceOrders, canViewProfile, canTrackOrders, ... }
}
```

**Enforcement via:**
- Supabase RLS policies on all tables
- Server-side middleware checks
- Role-based API route protection

---

### 📧 Email Services Architecture

**Two-layer email system for reliability:**

#### Layer 1: Supabase Auth Emails (Authentication)
- **Service:** Resend SMTP via Supabase
- **Templates:** 5 templates
  - Email confirmation (signup)
  - Password reset
  - Magic link login
  - User invitations
  - Email change verification
- **Configuration:** 
  ```
  SMTP Host: smtp.resend.com:465
  SMTP User: resend
  SMTP Pass: RESEND_API_KEY
  ```
- **Domain:** `restauranthubsolution.com` (verified)

#### Layer 2: Transactional/Marketing Emails (Resend)
- **Service:** Resend API (3,000 free emails/month)
- **Implementation:** Supabase Edge Function (`send-email`)
- **Templates:** 6 templates
  - Welcome campaign
  - Order confirmation
  - Subscription renewal
  - Abandoned cart
  - Re-engagement
  - Newsletter
- **Features:**
  - Automatic retry (3 attempts, exponential backoff)
  - Template variables support
  - Unsubscribe tracking
  - Webhook for delivery status
- **Performance:** 50ms (4x faster than direct API)

**Usage Example:**
```typescript
import { sendEmail } from '@/lib/email/sender';

await sendEmail({
  to: { email: 'user@example.com', name: 'John' },
  subject: 'Welcome!',
  template: 'welcome',
  templateData: { firstName: 'John', dashboardUrl: '...' }
});
```

---

### 🛡️ CAPTCHA & Bot Protection

**Cloudflare Turnstile for form protection:**

- **Implementation:** Supabase Edge Function (`verify-turnstile`)
- **Performance:** 15ms (6.7x faster than direct verification)
- **Protected Endpoints:**
  - `/api/auth/signup`
  - `/api/auth/signin`
  - `/api/account/password-reset`
- **Configuration:**
  ```
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...      # Public (frontend)
  TURNSTILE_SECRET_KEY=Md39Vr2tVLSZqVU...   # Private (Edge Function)
  ```
- **Response:** Verification success/failure + error codes

**Why Supabase Edge Function:**
- Secrets protected in Supabase vault (never exposed)
- Global edge distribution (15ms latency)
- Automatic CORS handling
- Built-in rate limiting

---

### 💾 Storage Buckets (Supabase)

**Four-bucket file storage system:**

| Bucket | Purpose | Public | Size Limit | MIME Types |
|--------|---------|--------|-----------|-----------|
| `avatars` | User profile photos | Yes | 5MB | jpg, png, webp, gif |
| `product-images` | Product catalog images | Yes | 5MB | jpg, png, webp, gif |
| `email-attachments` | Invoices, quotes, receipts | No | 10MB | PDF, Excel, CSV, images |
| `import-export` | CSV data imports/exports | No | 50MB | CSV only |

**RLS Policies:**
- Users can upload to own folder: `{user_id}/...`
- Admin bypass via service role
- Automatic cleanup on file deletion
- Storage triggers handle avatar updates

**Usage:**
```typescript
import { uploadAvatar, deleteAvatar } from '@/lib/storage';

// Upload avatar
const result = await uploadAvatar(file);
// → Returns public URL, auto-updates user_profiles.avatar_url

// Delete avatar
await deleteAvatar();
```

---

### 🔄 Authentication Workflow

**Multi-method authentication flow:**

```
1. Initial Form Submission
   ├─ Turnstile CAPTCHA verification (Edge Function)
   ├─ Rate limiting check (Upstash Redis)
   └─ Form validation (client-side)

2. Credential Submission
   ├─ Password hash (bcrypt via Supabase)
   ├─ OAuth sign-in (Google)
   └─ Magic link (email)

3. Session Management
   ├─ JWT stored in httpOnly cookie
   ├─ Session tracking (user_sessions table)
   ├─ Refresh token rotation
   └─ 24-hour expiration

4. RLS Enforcement
   ├─ All table queries filtered by auth.uid()
   ├─ Tenant isolation via tenant_id check
   └─ Role-based access control
```

**Key Functions:**
```typescript
// Get authenticated user (server)
const { data: { user } } = await supabase.auth.getUser();

// Check admin status
const isAdmin = await isRhsAdmin(userId);

// Verify role permissions
const canAccess = await has_tenant_role(tenantId, ['admin', 'owner']);
```

---

### 📊 Rate Limiting System

**Upstash Redis-backed rate limiting via Supabase Edge Functions:**

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| Login | 5 | 15 min | Brute force protection |
| Signup | 5 | 1 hour | Allow retries with different emails |
| Password Reset | 3 | 1 hour | Abuse prevention |
| Chat | 20 | 15 min | Spam prevention, allows normal conversation |
| API (authenticated) | 300 | 1 hour | Active dashboard usage |
| API (anonymous) | 30 | 1 hour | Guest usage |

**Implementation:**
```typescript
import { loginRateLimit } from '@/lib/rate-limit';

export async function POST(req) {
  const { success, remaining, reset } = await loginRateLimit(userId);
  
  if (!success) {
    return Response.json(
      { error: 'Too many attempts' },
      { status: 429, headers: { 'Retry-After': reset } }
    );
  }
}
```

**⚠️ Critical Setup Requirements:**

1. **Use REST Token, NOT Redis Password**:
   - Upstash provides two different credentials:
     - **REST Token** (starts with `ASqVAAInc...`) → Use this for edge functions
     - **Redis Password** → Only for `redis-cli`, NOT for edge functions
   - Always copy from **REST API** section in Upstash Console

2. **Secrets Go in Supabase, NOT Vercel**:
   - Rate limiting runs in **Supabase Edge Functions**
   - Vercel only calls the edge function endpoint
   - Set secrets via: `supabase secrets set UPSTASH_REDIS_REST_TOKEN="..." --project-ref YOUR_PROJECT_REF`

3. **After Setting Secrets, Redeploy Edge Function**:
   ```bash
   supabase functions deploy rate-limit-check --project-ref YOUR_PROJECT_REF --no-verify-jwt
   ```

**Graceful Degradation:**
- If Redis unavailable, rate limiting is bypassed (fails open)
- Requests still processed normally
- No errors exposed to frontend

**Environment (Supabase Secrets):**
```
UPSTASH_REDIS_REST_URL=https://safe-rodent-10901.upstash.io
UPSTASH_REDIS_REST_TOKEN=ASqVAAInc... (NOT the redis-cli password)
```

**See detailed setup:** `/docs/ENV_SETUP.md`

---

### 🌐 External Service Integrations

**Key third-party services:**

| Service | Purpose | Usage | Config |
|---------|---------|-------|--------|
| **Stripe** | Payments & subscriptions | Webhook handler for billing | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Urban Piper** | Delivery platform API | Restaurant delivery integrations | `URBAN_PIPER_API_KEY`, `DELIVERY_PROVIDER_WEBHOOK_SECRET` |
| **Groq/OpenAI** | AI models | Chat endpoint, embeddings | `GROQ_API_KEY`, `OPENAI_API_KEY` |
| **Cloudflare** | CAPTCHA + DNS | Turnstile verification, CDN | `TURNSTILE_SECRET_KEY`, `CLOUDFLARE_API_KEY` |
| **Resend** | Email delivery | Transactional emails via Edge Function | `RESEND_API_KEY` |
| **Upstash** | Redis caching | Rate limiting, session storage | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |

---

### 🚀 Deployment Pipeline

**Vercel → GitHub Actions → Supabase**

```yaml
# .github/workflows/supabase.yml triggers on:
- Push to main (supabase/** files)
- Pull request to main

# Jobs:
1. Validate (PR): supabase db lint --linked
2. Deploy (Push): 
   - supabase db push (migrations)
   - Deploys Edge Functions
   - Updates TypeScript types
```

**Environment Propagation:**
- `.env.local` → local development
- `vercel.env` → Vercel all environments
- Secrets (RESEND_API_KEY, etc.) → Vercel vault (not in code)

---

## Rate Limiting

Uses **Upstash Redis** for rate limiting (`apps/portal/lib/rate-limit.ts`):

| Limit Type | Window | Max Requests |
|------------|--------|--------------|
| `loginRateLimit` | 15 min | 5 |
| `passwordResetRateLimit` | 1 hour | 3 |
| `apiRateLimit` (auth users) | 1 hour | 100 |
| `anonRateLimit` | 1 hour | 30 |

Environment: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

Rate limiters gracefully degrade to `null` if Redis is not configured.

## Testing

Uses **Playwright** for E2E testing (`apps/portal/tests/`):

```bash
pnpm test              # Run all tests headless
pnpm test:ui           # Interactive UI mode
pnpm test:headed       # Run with visible browser
pnpm test:report       # View HTML report
```

Test files:
- `tests/marketing.spec.ts` - Public marketing pages
- `tests/auth.spec.ts` - Authentication flows
- `tests/protected-routes.spec.ts` - Auth guards
- `tests/database-flows.spec.ts` - Database workflow tests
- `tests/supabase-integration.spec.ts` - RLS policies, OAuth, workflows
- `tests/visual-stability.spec.ts` - CLS, layout shift, hydration tests
- `tests/flicker-detection.spec.ts` - Header flicker, position jump detection

**Dev server auto-starts** when running tests (configured in `playwright.config.ts`).

## Known Visual Issues (Hydration Flicker)

The header has hydration flicker issues in `components/store/store-header.tsx`:

**Root Cause**: `useState(false)` for auth state causes SSR/client mismatch:
```typescript
// PROBLEM: Starts false, then flips to true after useEffect
const [isAuthed, setIsAuthed] = useState(false);
```

**Fix Pattern** - Use `undefined` initial state with loading skeleton:
```typescript
const [isAuthed, setIsAuthed] = useState<boolean | undefined>(undefined);

// In JSX:
{isAuthed === undefined ? (
  <div className="h-10 w-24 animate-pulse bg-slate-200 rounded-full" /> // Skeleton
) : isAuthed ? (
  <UserMenu ... />
) : (
  <Link href="/login">Sign in</Link>
)}
```

**Affected Components**:
- `components/store/store-header.tsx` - Main header with auth state
- `components/store/user-menu.tsx` - Sign in button vs user dropdown

## Deployment

- **Vercel** deployment via `vercel.json` (root config points to apps/portal)
- Region: `iad1` (US East)
- Security headers configured in both `vercel.json` and `next.config.ts`

### Supabase Migration Workflow

**IMPORTANT**: When migrations are manually pushed to Supabase (via `supabase db push --linked`), they may get out of sync with Git-based CI/CD.

**Symptom**: GitHub Actions workflow fails with "Found local migration files to be inserted before the last migration on remote database."

**Solution**: The workflow uses `supabase db push --include-all` to automatically apply any missed migrations.

**Best Practice**:
1. Always create migrations locally with timestamps: `supabase migration new <name>`
2. Let GitHub Actions deploy them automatically on push to main
3. If you manually push migrations, the workflow will sync them on next push
4. Check migration status: `supabase migration list --linked`

**Never manually edit or delete applied migrations** - they are immutable in the remote database.

## MCP, CLI, and API Priority (Most Important!)

**Tool Selection Priority:**
1. **MCP Tools First** ✨ - Use Model Context Protocol tools (Supabase MCP, Vercel MCP)
   - Configured in `~/.../Code/User/mcp.json` with full credentials
   - Use `mcp_com_vercel_ve_*` tools for Vercel operations
   - Use `mcp_supabase_*` tools for Supabase operations
   - **Why**: MCP is always preferred - direct tool access, no CLI parsing, better structured data

2. **CLI Second** - Use command-line tools as fallback
   - `vercel` CLI for Vercel operations not available via MCP
   - `supabase` CLI for database operations not available via MCP
   - **Why**: CLI is powerful but harder to parse and slower than MCP

3. **API/fetch_webpage Last** - Only use direct API calls or web research as last resort
   - Use when MCP and CLI are insufficient
   - **Why**: Slowest, least reliable, requires manual parsing

**Example Decision Tree:**
```
Need to list Vercel deployments?
  → Use MCP: mcp_com_vercel_ve_list_deployments() ✅
  
Need to check Supabase migrations?
  → Use MCP: mcp_supabase_list_migrations() ✅
  
Need deployment logs not in MCP?
  → Fall back to CLI: vercel inspect <url> --logs
  
Need current syntax verification?
  → Fall back to fetch_webpage for official docs
```

## CLI and API Best Practices

**ALWAYS check official documentation before using CLI tools or APIs.**

### Vercel MCP

**Preferred**: Use MCP tools instead of CLI
- `mcp_com_vercel_ve_list_projects()` - List projects
- `mcp_com_vercel_ve_list_deployments()` - List deployments with metadata
- `mcp_com_vercel_ve_get_deployment()` - Get specific deployment details
- `mcp_com_vercel_ve_list_teams()` - List teams
- **Advantages**: Structured data, no parsing needed, faster

### Vercel CLI

**Fallback**: Use CLI only if MCP doesn't have the tool

Before running any `vercel` commands, consult the official documentation:
- Use `fetch_webpage` with Vercel CLI docs URL to get current syntax and options
- Example: Check https://vercel.com/docs/cli before deploying or inspecting deployments
- **Prefer CLI over REST API** for environment variable management:
  - `vercel env ls [environment]` - List environment variables in development/preview/production
  - `vercel env add [name] [environment]` - Add environment variable to specific environment
  - `vercel env update [name] [environment]` - Update existing environment variable
  - `vercel env pull [file]` - Export environment variables to local file
  - Example: `vercel env ls production` to verify production variables are set
- Other common patterns:
  - `vercel list` - List recent deployments
  - `vercel inspect <url> --logs` - Get build logs for a deployment
  - `vercel --version` - Check CLI version
- **Why CLI over REST API:** CLI is more capable, handles interactive prompts, and provides better error feedback than REST API calls

### Google Cloud CLI (gcloud) - OAuth Management

For OAuth credentials management, use the **beta commands** (note: deprecated but still functional):

**Available Beta Commands:**
```bash
# List OAuth clients for a brand
gcloud beta iap oauth-clients list BRAND --project=restaurant-hub-485622

# Describe a specific OAuth client
gcloud beta iap oauth-clients describe CLIENT_ID --brand=BRAND --project=restaurant-hub-485622

# Create a new Cloud IAP OAuth client
gcloud beta iap oauth-clients create BRAND --display_name="Your App Name" --project=restaurant-hub-485622

# Reset/rotate OAuth client secret
gcloud beta iap oauth-clients reset-secret CLIENT_ID --brand=BRAND --project=restaurant-hub-485622

# Delete an OAuth client
gcloud beta iap oauth-clients delete CLIENT_ID --brand=BRAND --project=restaurant-hub-485622
```

**⚠️ Important Notes:**
- These are **Cloud IAP OAuth clients** only, not general web application OAuth credentials
- APIs are **deprecated** and will be shut down March 19, 2026
- For web application OAuth 2.0 credentials: Use [Google API Console](https://console.developers.google.com/)
- Cannot manage standard OAuth credentials programmatically - must use web console

**Your OAuth Project:**
- Google Cloud Project: `restaurant-hub-485622`
- OAuth managed through Supabase (which handles Google OAuth provider)

### Google Workspace Admin Directory API Management

For managing Google Workspace resources (users, groups, aliases, domains, OUs), use the **Google Admin Directory API** via gcloud CLI.

**Full API Documentation:**
- **Users**: https://developers.google.com/admin-sdk/directory/reference/rest/v1/users
- **Groups**: https://developers.google.com/admin-sdk/directory/reference/rest/v1/groups
- **Domains**: https://developers.google.com/admin-sdk/directory/reference/rest/v1/domains
- **OUs**: https://developers.google.com/admin-sdk/directory/reference/rest/v1/orgunits

**Authentication Pattern:**
```bash
# All API calls use this pattern
ACCESS_TOKEN=$(gcloud auth application-default print-access-token 2>/dev/null) && \
curl -X POST "https://admin.googleapis.com/admin/directory/v1/users/admin@restauranthubsolution.com/aliases" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Goog-User-Project: restaurant-hub-485622" \
  -H "Content-Type: application/json" \
  -d '{"alias":"newalias@restauranthubsolution.com"}'
```

**Requirements:**
- Authenticate with: `gcloud auth application-default login`
- Admin SDK API enabled: https://console.developers.google.com/apis/api/admin.googleapis.com
- Use `X-Goog-User-Project: restaurant-hub-485622` header for quota attribution

**Current Google Workspace Setup:**
- Domain: `restauranthubsolution.com`
- Primary Admin: `admin@restauranthubsolution.com`
- Google Group: `dev@restauranthubsolution.com` (members: gwaelg@gmail.com)
- Email Aliases: `hello@`, `support@`, `supplies@` → forward to admin@
- Project: `restaurant-hub-485622`

### Supabase MCP

**Preferred**: Use MCP tools instead of CLI
- `mcp_supabase_list_migrations()` - List migrations
- `mcp_supabase_list_branches()` - List branches
- `mcp_supabase_execute_sql()` - Run SQL queries
- `mcp_supabase_deploy_edge_function()` - Deploy edge functions
- `mcp_supabase_generate_typescript_types()` - Generate TypeScript types
- **Advantages**: Structured data, secure credential handling, no local CLI setup needed

### Supabase CLI

**Fallback**: Use CLI only if MCP doesn't have the tool

Before running any `supabase` commands, consult the official documentation:
- Use `fetch_webpage` with Supabase CLI docs URL to verify command syntax
- Example: Check h[ttps://supabase.com/docs/reference/cli](https://supabase.com/docs/) before migrations or database operations
- Common patterns:
  - `supabase migration list --linked` - Check migration status
  - `supabase db push --include-all` - Apply all migrations including out-of-order ones
  - `supabase gen types typescript --linked` - Regenerate TypeScript types

### General Rule

**For any external CLI or API (Azure, AWS, GitHub, etc.):**
1. Use `fetch_webpage` to retrieve the official documentation
2. Verify command syntax, required flags, and options
3. Then execute the command with confidence

This ensures we always use the correct, up-to-date syntax and avoid errors from outdated assumptions.

## 🔍 Diagnostic Workflow - Checking Logs & Current State

**When you need to understand current state or investigate issues:**

Always gather information from three sources **before moving to the next step**:

### 1. **Supabase CLI** - Database & Function State
```bash
# Check database migrations
supabase migration list --linked

# View edge function deployment status
supabase functions list --linked

# Check database schema
supabase gen types typescript --linked --output stdout | head -50

# View database logs (for errors in triggers, RLS, etc.)
supabase logs push --linked
supabase logs function-all --linked
```

### 2. **Vercel CLI** - Deployment & Build Logs
```bash
# List recent deployments
vercel list

# Get build logs for a specific deployment
vercel inspect <deployment-url> --logs

# Check environment variables
vercel env list

# View current project settings
vercel project ls
```

### 3. **GitHub Workflows** - CI/CD Pipeline Status
```bash
# Check workflow status (view in browser or use GitHub CLI)
gh workflow view            # List all workflows
gh run list                 # List recent workflow runs
gh run view <run-id> --log  # View specific workflow logs

# Check specific workflow file
# Navigate to: .github/workflows/supabase.yml or vercel.yml
```

### Decision Checklist

**Before making ANY change:**
- ☑️ Run `supabase migration list --linked` - Are migrations in sync?
- ☑️ Run `vercel list` - What's the current deployment status?
- ☑️ Check GitHub workflow runs - Did CI/CD pass on main?
- ☑️ Review deployment dates - When was the last successful build?
- ☑️ Check edge function status - Are Supabase functions running?

**Why This Matters:**
- Prevents acting on stale assumptions
- Identifies deployment issues before debugging locally
- Reveals if migrations are out of sync with production
- Shows if GitHub Actions is blocking changes
- Catches environment variable misconfigurations

### Example Workflow

```
User: "The login endpoint seems slow"
↓
Agent checks logs:
  supabase logs function-all --linked    # Check auth function performance
  vercel inspect <prod-url> --logs       # Check request latency
  gh run list                             # Check if CI/CD added overhead
↓
Agent identifies: "RLS policies running 3 extra queries"
↓
Agent proposes: "Add database indexes to these columns"
↓
Waits for user approval before implementing
```

**Golden Rule:** Data beats assumptions. Always check current state with CLI tools before proposing changes.

---

## 📌 Quick Reference

**Get Started Quickly:**
```bash
cp apps/portal/.env.example apps/portal/.env.local  # Set up env
pnpm install                                          # Install deps
pnpm dev:portal                                       # Start dev server
pnpm test                                             # Run tests
pnpm build:portal                                     # Build for prod
```

**Key Files:**
- **Architecture**: `Architecture Overview` section (above)
- **Database**: See `docs/DATABASE.md`
- **Deployment**: See `docs/DEPLOYMENT.md`
- **API Design**: See `Route Organization` section
- **Security**: See `Multi-Tenancy & Auth` section
- **Styling**: See `UI & Performance Architecture` section

**Need to...**
- Add a feature? Start with `Research & Best Practices`
- Fix a bug? Check `Diagnostic Workflow` for current state
- Refactor code? Review `Design Principles` + `Approval Workflow`
- Write styles? Check `CSS & Tailwind Error Handling`
- Deploy changes? See `Diagnostic Workflow` + `docs/DEPLOYMENT.md`
- Review someone's work? Use `Code Style & Formatting` as checklist

---

*Last updated: 2026-02-04 | Questions? Check the sections above or propose improvements.*
