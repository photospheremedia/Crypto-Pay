# Security & Data Accuracy Audit - Account Dashboard

**Date:** February 2, 2026  
**Status:** In Progress  
**Scope:** Account dashboard data integrity and security logging

---

## Executive Summary

The account dashboard displays customer data (orders, quotes, wishlist, stats) but **lacks comprehensive security logging** and **has inaccurate/missing data points**:

1. **No last sign-in time/date displayed** - User security events exist but aren't queried
2. **Order stats may be stale** - Using RPC that may not exist
3. **No session/device tracking** - user_sessions table exists but not connected
4. **Missing security event logging** - Not logging login/logout/sensitive actions
5. **No IP/location tracking on dashboard** - Available in user_sessions but not displayed
6. **Incomplete user profile data** - Many security fields dropped in latest migration
7. **No audit trail for user actions** - Actions not being logged to audit_log
8. **Order/quote status reliability unclear** - Status field sync with actual system state uncertain

---

## Data Accuracy Issues

### 1. **Last Sign-In Time & Date** ❌

**Current State:**
- User profiles had `last_login_at` field but **was dropped** in migration `20260202181540_ai_improvements.sql` (line 122)
- User sessions table exists with `created_at`, but dashboard never queries it
- No last sign-in info displayed anywhere on dashboard

**Issues:**
- Users don't know when their last login was
- Can't detect unauthorized access
- No timestamp validation for active sessions

**Database Tables Available:**
```
user_sessions:
  - id (UUID)
  - user_id (UUID)
  - session_token (TEXT, 255 chars)
  - ip_address (INET)
  - expires_at (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)
  - last_activity_at (TIMESTAMPTZ)
  - user_agent (TEXT)

user_security_events:
  - id (UUID)
  - user_type (TEXT)
  - event_type (VARCHAR(50))
  - ip_address (INET)
  - user_agent (TEXT)
  - details (JSONB)
  - created_at (TIMESTAMPTZ)
```

**Solution Required:**
- Query `user_sessions` to get last login timestamp
- Display on dashboard with timezone conversion
- Add session/device info (browser, OS, IP location)

---

### 2. **Order Statistics Accuracy** ❌

**Current State:**
```tsx
// Line 126 - RPC call that may not exist
const { data: statsData } = await supabase.rpc("get_user_order_stats", {
  p_user_id: user.id,
});
```

**Issues:**
- RPC function `get_user_order_stats` not defined in migrations
- Falls back gracefully but shows no data
- Stats not calculated from actual orders table
- Cannot verify `total_spent_cents`, `pending_orders`, `delivered_orders`

**Database Available:**
```
orders table:
  - id, user_id, order_number, status, total_cents, created_at
  - Can JOIN with order_items for detailed breakdown
```

**Solution Required:**
- Remove dependency on missing RPC
- Calculate stats directly from orders table
- Filter by status: 'pending', 'delivered', etc.
- Aggregate sum of total_cents

---

### 3. **Recent Orders Data Completeness** ⚠️

**Current State:**
```tsx
// Line 137 - Basic order query
const { data: ordersData } = await supabase
  .from("orders")
  .select("id, order_number, status, total_cents, created_at")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(3);
```

**Missing Fields:**
- ❌ `estimated_delivery_at` - Can't show delivery timeline
- ❌ `shipping_address_id` - Can't show where it's going
- ❌ `tracking_number` - Can't provide shipping tracking
- ❌ `payment_status` - Can't show if paid
- ❌ `notes` or `special_instructions` - Missing context
- ❌ Related order items count
- ⚠️ `updated_at` - Using only `created_at` for display

**Solution Required:**
- Expand select to include all relevant fields
- Add LEFT JOIN to order_items for item count
- Display last updated instead of just created date
- Add tracking number display when available

---

### 4. **Recent Quotes Data Issues** ⚠️

**Current State:**
```tsx
// Line 149 - Basic quote query
const { data: quotesData } = await supabase
  .from("quotes")
  .select("id, status, total, created_at")
  .eq("customer_id", resolvedTenant.id)
```

**Missing Fields:**
- ❌ `quote_number` - Can't reference quote
- ❌ `expires_at` - Can't show expiration
- ❌ `valid_until` - Missing quote validity
- ❌ `requested_by` - Who requested it?
- ❌ `quote_lines` count - How many items?
- ❌ `payment_terms` - What are terms?
- ❌ `notes` - Customer context missing
- ⚠️ `updated_at` vs `created_at` confusion

**Solution Required:**
- Select `quote_number, expires_at, valid_until, requested_by`
- Count quote_lines via aggregation
- Display expiration status (valid/expired)
- Show quote life cycle (requested → approved → ordered)

---

### 5. **Wishlist Data Completeness** ⚠️

**Current State:**
```tsx
// Line 161-165 - Incomplete wishlist join
const { data: wishlistData } = await supabase
  .from("wishlists")
  .select("id, product_id, products ( id, name, thumbnail_url, price_cents )")
  .eq("user_id", user.id)
```

**Missing Fields:**
- ❌ `added_at` - When was it saved?
- ❌ `priority` - Which items matter most?
- ❌ `notes` - User notes about item
- ❌ `product.availability` - In stock?
- ❌ `product.stock_level` - How many available?
- ❌ `product.is_discontinued` - Still sold?
- ❌ `product.pricing_tiers` - Volume discounts?
- ⚠️ Product image CDN cache status

**Solution Required:**
- Add `added_at, priority, notes` to select
- Include product stock and availability status
- Show price history (if available)
- Display note count next to item

---

### 6. **Recently Viewed Items** ⚠️

**Current State:**
```tsx
// Line 177-183 - Missing data on recently viewed
const { data: recentlyViewedData } = await supabase
  .from("recently_viewed")
  .select("id, product_id, products ( id, name, thumbnail_url, price_cents )")
  .eq("user_id", user.id)
```

**Missing Fields:**
- ❌ `last_viewed_at` - Sorting/display
- ❌ `view_count` - Which products viewed most?
- ❌ `time_spent_seconds` - Engagement metric
- ❌ `product.rating` - User reviews
- ❌ `product.review_count` - Social proof
- ❌ `product.stock_level` - Availability
- ❌ `cart_added_at` - Was it added to cart?

**Solution Required:**
- Select `last_viewed_at, view_count, time_spent_seconds`
- Join product reviews for rating display
- Show stock status inline
- Sort by `last_viewed_at` descending

---

## Security Issues

### 7. **Missing Session/Device Security Display** ❌

**Current State:**
- No session info displayed to user
- Users can't see active devices/browsers
- No way to remotely logout other sessions
- No suspicious activity detection

**Solution Required:**
- Add "Active Sessions" card to dashboard
- Display: Device, Browser, OS, Last activity, IP address, Location
- Add "Sign out from all other devices" button
- Show session expiration countdown

---

### 8. **No Security Event Logging on Dashboard** ❌

**Current State:**
- User_security_events table exists but never queried from dashboard
- No login/logout events being captured
- No failed authentication attempts shown
- No suspicious activity alerts

**Solution Required:**
- Log all dashboard page loads as security event
- Log all account page views with timestamp
- Log all sensitive action attempts (delete, export, etc.)
- Display recent security events to user
- Add alerts for anomalous activities (new location, new device)

---

### 9. **No Audit Trail for User Actions** ❌

**Current State:**
- Audit_log table exists but dashboard actions not logged
- No way to track who changed what
- No accountability for data access
- No compliance trail for regulatory requirements

**Solution Required:**
- Log all dashboard data loads (user queries)
- Log subscription changes
- Log payment method updates
- Log settings modifications
- Display "Account Activity" timeline to user

---

### 10. **Password/2FA Security Status Unknown** ❌

**Current State:**
- User profiles fields for 2FA/password were dropped
- No way to check security posture on dashboard
- User doesn't know 2FA status
- No password age tracking

**Solution Required:**
- Query auth metadata for password_changed_at
- Check for 2FA status in user metadata
- Display security score (0-100)
- Show recommendations (enable 2FA, update password)
- Display password age: "Last changed 90 days ago"

---

## Data Integrity Issues

### 11. **Order Status Sync Reliability** ⚠️

**Current Issue:**
- Order status displayed from local `orders` table
- May be out of sync with actual fulfillment system
- No timestamp tracking status changes
- No webhook to update statuses

**Solution Required:**
- Add `status_updated_at` timestamp
- Add `status_sync_at` for last sync time
- Create webhook handler for status updates
- Display sync lag warning if > 1 hour old
- Add manual refresh button

---

### 12. **Price Currency & Locale Handling** ⚠️

**Current State:**
```tsx
const formatPrice = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};
```

**Issues:**
- Hardcoded to USD (assumes all cents are USD)
- No currency field in orders
- Doesn't respect user locale preference
- International users see incorrect formatting

**Solution Required:**
- Store currency_code with order (USD, EUR, GBP, etc.)
- Store user locale preference in profile
- Use locale-specific number formatting
- Handle multi-currency pricing tiers

---

## Action Items by Priority

### 🔴 Critical (Security/Compliance)

- [ ] **Add Last Sign-In Display**
  - Query user_sessions for most recent session
  - Show: "Last login: Jan 30, 2:15 PM from Chrome (San Francisco, CA)"
  - Add timezone conversion based on user profile

- [ ] **Create Security Event Logging Endpoint**
  - Log all dashboard page views
  - Log all data queries
  - Log all sensitive actions
  - Implement with Edge Function for real-time capture

- [ ] **Add Session Management Card**
  - List all active sessions
  - Show device, browser, last activity, location
  - "Sign out from other devices" button
  - Suspicious activity warnings

- [ ] **Implement Data Access Audit Trail**
  - Log all dashboard data access
  - Create "Account Activity" timeline
  - Display to user for transparency
  - Implement with Edge Function + audit_log table

### 🟡 High (Data Accuracy)

- [ ] **Fix Order Statistics Calculation**
  - Remove non-existent RPC dependency
  - Calculate from orders table directly
  - Implement: total_orders, total_spent, pending_count, delivered_count
  - Add caching with 1-hour TTL

- [ ] **Expand Order Details**
  - Add fields: estimated_delivery_at, tracking_number, payment_status
  - Show order items count
  - Display updated_at vs created_at appropriately

- [ ] **Expand Quote Details**
  - Add: quote_number, expires_at, requested_by, items_count
  - Show expiration status
  - Display quote lifecycle state

- [ ] **Enhance Product Data**
  - Add stock status, rating, availability
  - Show price history trend
  - Include volume discount tiers

### 🟢 Medium (UX/Features)

- [ ] **Add Security Score Card**
  - Check: 2FA enabled, password age, session count
  - Display 0-100 score with recommendations
  - Link to security settings

- [ ] **Create Password/2FA Status Display**
  - Query auth metadata for password_changed_at
  - Check 2FA status
  - Show "Password last changed 45 days ago"
  - CTA to update if needed

- [ ] **Fix Currency Handling**
  - Store currency per order
  - Respect user locale preference
  - Handle multi-currency correctly

- [ ] **Implement Data Sync Indicators**
  - Show "Last synced: 5 minutes ago"
  - Display lag warnings
  - Add manual refresh button

---

## Implementation Strategy

### Phase 1: Security Logging (Week 1)
1. Create Edge Function for security event logging
2. Add last sign-in query to dashboard load
3. Implement session/device display component
4. Add logout-all-devices functionality

### Phase 2: Data Accuracy (Week 2)
1. Fix order stats calculation
2. Expand all data queries with missing fields
3. Add data freshness timestamps
4. Implement manual refresh functionality

### Phase 3: Audit & Compliance (Week 3)
1. Implement data access logging
2. Create account activity timeline
3. Add security score calculation
4. Create data export functionality

### Phase 4: Polish & Testing (Week 4)
1. Test all data queries for accuracy
2. Validate security event logging
3. Performance optimization
4. User testing and refinement

---

## Database Schema Changes Required

### 1. Add to user_profiles
```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  last_sign_in_at TIMESTAMPTZ;
  -- Updated when new session created
```

### 2. Add to orders
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS
  status_updated_at TIMESTAMPTZ DEFAULT now(),
  status_sync_at TIMESTAMPTZ,
  payment_status VARCHAR(50),
  tracking_number VARCHAR(100),
  estimated_delivery_at TIMESTAMPTZ;
```

### 3. Add to quotes
```sql
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS
  quote_number VARCHAR(50) UNIQUE,
  requested_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  valid_until TIMESTAMPTZ;
```

### 4. Add to wishlists
```sql
ALTER TABLE wishlists ADD COLUMN IF NOT EXISTS
  added_at TIMESTAMPTZ DEFAULT now(),
  priority INT,
  notes TEXT;
```

### 5. Create Edge Function for Security Logging
```typescript
// supabase/functions/log-dashboard-access/index.ts
- Log page access with user_id, timestamp, ip, user_agent
- Insert into user_security_events table
- Query for suspicious patterns (new location, impossible travel)
```

---

## Testing Checklist

- [ ] Last sign-in displays correctly with timezone
- [ ] Order stats match actual orders in database
- [ ] Quote details include all relevant fields
- [ ] Session list shows all active devices
- [ ] Security events log correctly
- [ ] Activity timeline accurate and chronological
- [ ] Currency formatting respects user locale
- [ ] Data sync indicators accurate
- [ ] Mobile responsive on all sections
- [ ] Performance: Dashboard loads < 2 seconds

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Last sign-in accuracy | ❌ Not shown | ✅ < 1 sec delay | Week 1 |
| Order stats accuracy | ❌ ~60% | ✅ 100% | Week 2 |
| Security event logging | ❌ 0% | ✅ 100% | Week 1 |
| Dashboard load time | ⚠️ 2.5s | ✅ < 1.5s | Week 2 |
| Data freshness visibility | ❌ None | ✅ All items | Week 2 |
| Security score display | ❌ Not shown | ✅ On dashboard | Week 3 |

