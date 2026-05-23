# Database Setup Guide

## Overview

Restaurant Hub Solution uses **Supabase** as the database backend. The schema is organized into migrations for easy deployment and version control.

## Schema Structure

### Core Tables (Base Schema)
| Table | Purpose |
|-------|---------|
| `user_profiles` | Extended user data (linked to Supabase auth) |
| `user_settings` | User preferences and configurations |
| `organizations` | Multi-location business accounts |
| `organization_members` | Team member access |
| `locations` | Physical restaurant locations |
| `orders` | Supply and service orders |
| `order_items` | Individual items in orders |
| `quotes` | Custom quote requests |
| `delivery_integrations` | Connected delivery platforms |
| `support_tickets` | Customer support requests |
| `support_ticket_messages` | Ticket conversation threads |
| `activity_log` | Audit trail |

### Shop Tables (Migration 002)
| Table | Purpose |
|-------|---------|
| `products` | Product catalog |
| `product_categories` | Hierarchical categories |
| `product_reviews` | Customer reviews and ratings |
| `carts` | Shopping carts |
| `cart_items` | Items in carts |
| `wishlists` | Saved/favorited products |
| `promotions` | Discount codes |
| `promotion_usage` | Coupon usage tracking |

### Urban Piper Integration (Migration 002)
| Table | Purpose |
|-------|---------|
| `urban_piper_subscriptions` | Client tech service subscriptions |
| `up_delivery_integrations` | Connected delivery platforms per subscription |
| `up_onboarding_tickets` | Onboarding progress tracking |

## Deployment Steps

### 1. Deploy Base Schema
Run in Supabase SQL Editor:
```sql
-- Run the contents of database-schema-supabase.sql
```

### 2. Deploy Shop & Urban Piper Migration
```sql
-- Run: supabase/migrations/20260130000002_shop_and_urban_piper.sql
```

### 3. Seed Initial Data
```sql
-- Run: supabase/migrations/20260130000003_seed_shop_data.sql
```

## Quick Deploy Script

```bash
# Using Supabase CLI
cd crypto-pay

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Or use the SQL Editor in Supabase Dashboard
```

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only access their own data
- Products/categories are publicly readable
- Admins have full access to manage content

### Automatic Triggers
- `updated_at` timestamps auto-update on changes
- Product review stats (avg rating, count) auto-calculate
- Cart totals auto-calculate when items change
- Category product counts auto-update

### Generated IDs
- Order numbers: `RHS-YYYYMMDD-XXXX`
- Quote numbers: `RHQ-YYYYMMDD-XXXX`
- Ticket numbers: `RHT-YYYYMMDD-XXXX`

## Entity Relationships

```
user_profiles (auth.users)
├── user_settings (1:1)
├── organizations (1:N owner)
│   ├── organization_members (N:M users)
│   ├── locations (1:N)
│   └── urban_piper_subscriptions (1:1)
│       └── up_delivery_integrations (1:N)
├── orders (1:N)
│   └── order_items (1:N)
├── carts (1:N)
│   └── cart_items (1:N)
├── wishlists (1:N)
├── product_reviews (1:N)
└── support_tickets (1:N)
    └── support_ticket_messages (1:N)

products
├── product_reviews (1:N)
├── cart_items (1:N)
└── wishlists (1:N)

product_categories (self-referential hierarchy)
```

## Environment Variables

Make sure your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-side only)
```

## Testing the Schema

After deployment, verify:

1. **Auth trigger works:**
   - Sign up a new user
   - Check `user_profiles` and `user_settings` were created

2. **Products load:**
   ```sql
   SELECT name, price_cents, status FROM products WHERE status = 'active';
   ```

3. **Categories populated:**
   ```sql
   SELECT name, slug, level FROM product_categories ORDER BY level, display_order;
   ```

4. **RLS works:**
   - Try accessing data as anon user
   - Verify only public data is visible

## Migrations Checklist

- [x] `0001_tenants.sql` - Multi-tenant setup
- [x] `0002_core.sql` - Core tables
- [x] `0003_rebrand.sql` - Branding updates
- [x] `0004_rls_definer.sql` - RLS policies
- [x] `0005_profiles_billing.sql` - Profile & billing
- [x] `0006_roles_cleanup.sql` - Role cleanup
- [x] `20260127000001_add_leads.sql` - Leads system
- [x] `20260128000001_add_newsletter.sql` - Newsletter
- [x] `20260128000002_update_trigger_new_fields.sql` - Trigger updates
- [x] `20260130000001_customer_pricing.sql` - Customer pricing
- [x] `20260130000002_shop_and_urban_piper.sql` - Shop + Urban Piper
- [x] `20260130000003_seed_shop_data.sql` - Initial products & categories
- [ ] Future: Search indexes (pg_trgm)
- [ ] Future: Full-text search on products
- [ ] Future: Inventory management triggers
