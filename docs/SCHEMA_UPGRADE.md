# Professional Schema Upgrade

## Overview
This migration introduces professional-grade tables for customer management, settings, and guest tracking.

## New Tables

### 1. `tenant_settings`
Stores all configuration for each tenant/store.

| Field | Type | Description |
|-------|------|-------------|
| `store_name`, `store_email`, `store_phone` | TEXT | Store contact info |
| `store_address` | JSONB | Full address object |
| `timezone`, `currency`, `tax_rate` | Various | Business settings |
| `min_order_amount_cents`, `delivery_fee_cents` | INTEGER | Order settings |
| `notify_*` | BOOLEAN | Notification preferences |
| `operating_hours` | JSONB | Business hours array |
| `social_links` | JSONB | Social media links |
| `meta_title`, `meta_description` | TEXT | SEO settings |

### 2. `shop_customers`
Actual buyers/customers of the shop (NOT platform users).

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Optional link to auth user |
| `email`, `first_name`, `last_name`, `phone` | TEXT | Contact info |
| `full_name` | GENERATED | Auto-computed full name |
| `billing_address`, `shipping_address` | JSONB | Addresses |
| `status` | TEXT | active, inactive, blocked, vip |
| `accepts_marketing` | BOOLEAN | Marketing consent |
| `tags` | TEXT[] | Segmentation tags |
| `total_orders`, `total_spent_cents` | Various | Stats (auto-updated) |
| `source`, `source_details` | TEXT/JSONB | Attribution |

### 3. `guest_sessions`
Track anonymous visitors for conversion and analytics.

| Field | Type | Description |
|-------|------|-------------|
| `session_token` | TEXT | Unique session ID |
| `email`, `name`, `phone` | TEXT | Captured at checkout/chat |
| `ip_address` | INET | For geolocation |
| `geo_*` | Various | IP-derived location |
| `utm_*`, `referrer`, `landing_page` | TEXT | Attribution |
| `cart_items`, `cart_total_cents` | JSONB/INT | Abandoned cart recovery |
| `converted_to_customer_id` | UUID | Link when converted |

### 4. Orders Enhancement
New columns added to `orders`:

| Field | Type | Description |
|-------|------|-------------|
| `shop_customer_id` | UUID | Link to shop_customers |
| `guest_session_id` | UUID | Link to guest_sessions |
| `is_guest_order` | BOOLEAN | True for guest checkout |
| `guest_email`, `guest_name`, `guest_phone` | TEXT | Guest info if no account |

## Views

### `customer_analytics`
Combines customers and leads in a unified view for analytics:
- Customer type (customer vs lead)
- Registration status
- Order stats
- Attribution data

## Functions

### `update_customer_order_stats()`
Trigger function that automatically updates customer statistics when orders are placed.

### `convert_guest_to_customer(guest_session_id, tenant_id)`
Converts a guest session to a shop customer, preserving attribution data.

## How to Apply

```bash
# From project root
cd supabase
supabase db push

# Or run directly in Supabase SQL Editor
# Copy contents of: supabase/migrations/20260201_professional_schema_upgrade.sql
```

## After Migration

1. Regenerate TypeScript types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/portal/types/supabase.ts
```

2. The APIs will automatically use the new tables when available, with fallback to old schema.

## Data Model Summary

```
Platform Users (user_profiles)     Shop Customers (shop_customers)
├── Admins                         ├── Registered (has user_id)
├── Staff                          └── Unregistered (email only)
└── Owners                         
                                   Guest Sessions (guest_sessions)
                                   ├── Anonymous visitors
                                   ├── Cart abandoners
                                   └── Leads (contact captured)
```

## Key Differentiators

| Old Schema | New Schema |
|------------|------------|
| `user_profiles` = everyone | `user_profiles` = platform staff only |
| No guest support | `guest_sessions` + guest orders |
| Settings in tenant `metadata` | Dedicated `tenant_settings` table |
| No customer stats | Auto-computed `total_orders`, `total_spent` |
| No IP geolocation fields | `geo_*` fields for location analytics |
| No marketing consent | `accepts_marketing` + `marketing_opt_in_at` |
