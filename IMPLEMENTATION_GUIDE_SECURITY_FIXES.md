# Implementation Guide - Dashboard Security & Data Fixes

**Status:** Ready for Implementation  
**Priority:** Critical (Security) → High (Data Accuracy) → Medium (UX)

---

## 1. Last Sign-In Time Fix

### Issue
User profiles no longer have `last_login_at` field. Need to query user_sessions instead.

### Current Code (Broken)
```tsx
// Currently no last sign-in displayed at all
```

### Solution: Query User Sessions

**Database Query:**
```sql
-- Get user's most recent session
SELECT 
  id,
  created_at as login_at,
  last_activity_at,
  ip_address,
  user_agent,
  expires_at
FROM user_sessions
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 1;
```

**React Code to Add:**
```tsx
// apps/portal/app/account/page.tsx

type LastSession = {
  id: string;
  login_at: string;
  last_activity_at: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
};

// Add to state
const [lastSession, setLastSession] = useState<LastSession | null>(null);

// Add to loadDashboardData function (after user is loaded)
try {
  const { data: sessionData } = await supabase
    .from("user_sessions")
    .select("id, created_at, last_activity_at, ip_address, user_agent, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  
  if (sessionData) {
    setLastSession(sessionData as any);
  }
} catch {
  // No sessions found yet
}

// Helper function to parse user agent
const parseUserAgent = (ua: string): { browser: string; os: string } => {
  // Simple parsing - for production use a library like 'ua-parser-js'
  let browser = "Unknown";
  let os = "Unknown";
  
  if (ua.includes("Chrome")) browser = "Chrome";
  if (ua.includes("Safari")) browser = "Safari";
  if (ua.includes("Firefox")) browser = "Firefox";
  if (ua.includes("Edge")) browser = "Edge";
  
  if (ua.includes("Windows")) os = "Windows";
  if (ua.includes("Mac")) os = "macOS";
  if (ua.includes("Linux")) os = "Linux";
  if (ua.includes("iPhone")) os = "iOS";
  if (ua.includes("Android")) os = "Android";
  
  return { browser, os };
};

// Display component to add in JSX:
{lastSession && (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
        <Shield className="h-5 w-5 text-green-600" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Security & Access</h2>
    </div>
    
    <div className="space-y-4">
      {/* Last Sign In */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Last Sign In</p>
        <p className="text-xl font-bold text-slate-900 mt-2">
          {new Date(lastSession.login_at).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            💻 {parseUserAgent(lastSession.user_agent || "").browser}
          </span>
          <span className="flex items-center gap-1">
            🖥️ {parseUserAgent(lastSession.user_agent || "").os}
          </span>
        </div>
      </div>
      
      {/* Session Expires */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm text-slate-500">Session Expires</p>
        <p className="text-sm font-semibold text-slate-900 mt-2">
          {new Date(lastSession.expires_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 2. Order Statistics Accuracy Fix

### Issue
RPC function `get_user_order_stats` doesn't exist. Need to calculate from orders table.

### Current Code (Broken)
```tsx
const { data: statsData } = await supabase.rpc("get_user_order_stats", {
  p_user_id: user.id,
});
if (statsData?.[0]) {
  setStats(statsData[0]);
}
```

### Solution: Direct Calculation

**Database Query:**
```sql
-- Calculate order stats directly
SELECT 
  COUNT(*) as total_orders,
  SUM(total_cents) as total_spent_cents,
  SUM(CASE WHEN status IN ('pending', 'processing') THEN 1 ELSE 0 END) as pending_orders,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
FROM orders
WHERE user_id = $1;
```

**React Code to Replace:**
```tsx
// Replace the RPC call section (around line 126-133)

// Remove this:
// try {
//   const { data: statsData } = await supabase.rpc("get_user_order_stats", {
//     p_user_id: user.id,
//   });

// Replace with this:
try {
  const { data: ordersForStats } = await supabase
    .from("orders")
    .select("status, total_cents")
    .eq("user_id", user.id);
  
  if (ordersForStats && ordersForStats.length > 0) {
    const statsData = {
      total_orders: ordersForStats.length,
      total_spent_cents: ordersForStats.reduce((sum, order) => sum + (order.total_cents || 0), 0),
      pending_orders: ordersForStats.filter(o => ["pending", "processing"].includes(o.status)).length,
      delivered_orders: ordersForStats.filter(o => o.status === "delivered").length,
    };
    setStats(statsData as OrderStats);
  }
} catch {
  // Table may not exist yet - set default stats
  setStats({
    total_orders: 0,
    total_spent_cents: 0,
    pending_orders: 0,
    delivered_orders: 0,
  });
}
```

---

## 3. Expand Order Query with Missing Fields

### Issue
Missing: estimated_delivery_at, tracking_number, payment_status

### Current Code
```tsx
const { data: ordersData } = await supabase
  .from("orders")
  .select("id, order_number, status, total_cents, created_at")
  .eq("user_id", user.id)
```

### Solution
```tsx
// Replace the order query (around line 137-142)

try {
  const { data: ordersData } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      total_cents,
      created_at,
      updated_at,
      payment_status,
      tracking_number,
      estimated_delivery_at,
      shipping_address_id
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);
  
  setRecentOrders(ordersData || []);
} catch {
  // Table may not exist yet
}
```

**Update Type Definition:**
```tsx
type RecentOrder = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  updated_at?: string;
  payment_status?: string;
  tracking_number?: string;
  estimated_delivery_at?: string;
  shipping_address_id?: string;
};
```

---

## 4. Expand Quote Query with Missing Fields

### Issue
Missing: quote_number, expires_at, requested_by, item count

### Current Code
```tsx
const { data: quotesData } = await supabase
  .from("quotes")
  .select("id, status, total, created_at")
  .eq("customer_id", resolvedTenant.id)
```

### Solution
```tsx
// Replace the quote query (around line 149-154)

if (resolvedTenant) {
  try {
    const { data: quotesData } = await supabase
      .from("quotes")
      .select(`
        id,
        quote_number,
        status,
        total,
        created_at,
        updated_at,
        expires_at,
        valid_until,
        requested_by,
        quote_lines(count)
      `)
      .eq("customer_id", resolvedTenant.id)
      .order("created_at", { ascending: false })
      .limit(3);
    
    setRecentQuotes(quotesData || []);
  } catch {
    // Table may not exist yet
  }
}
```

**Update Type Definition:**
```tsx
type Quote = {
  id: string;
  quote_number?: string;
  status: string;
  total: number;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  valid_until?: string;
  requested_by?: string;
  quote_lines?: { count: number }[];
};
```

---

## 5. Add Security Event Logging Edge Function

### Create Edge Function

**File: `supabase/functions/log-security-event/index.ts`**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId, eventType, ipAddress, userAgent } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Log security event
    const { error: logError } = await supabaseAdmin
      .from("user_security_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent,
        details: {
          timestamp: new Date().toISOString(),
          event: eventType,
        },
      });

    if (logError) {
      console.error("Security logging error:", logError);
    }

    // Check for suspicious activity (new location, new device)
    if (eventType === "login") {
      const { data: recentLogins } = await supabaseAdmin
        .from("user_security_events")
        .select("ip_address, user_agent, created_at")
        .eq("user_id", userId)
        .eq("event_type", "login")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentLogins && recentLogins.length > 1) {
        const lastLogin = recentLogins[0];
        const prevLogin = recentLogins[1];

        if (
          lastLogin.ip_address !== prevLogin.ip_address ||
          lastLogin.user_agent !== prevLogin.user_agent
        ) {
          // New device or location - could create alert
          console.log("New device/location detected for user:", userId);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Call from Dashboard

**In `account/page.tsx` useEffect:**

```tsx
// Add after user load (line ~100)
useEffect(() => {
  async function logSecurityEvent() {
    if (!user) return;

    try {
      await fetch("/api/log-security-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          eventType: "dashboard_access",
          ipAddress: null, // Set server-side from header
          userAgent: navigator.userAgent,
        }),
      });
    } catch {
      console.error("Failed to log security event");
    }
  }

  logSecurityEvent();
}, [user]);
```

---

## 6. Database Migrations for Missing Fields

**File: `supabase/migrations/20260202000001_dashboard_data_fixes.sql`**

```sql
-- Add missing fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add updated_at trigger to orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_update_updated_at ON public.orders;
CREATE TRIGGER orders_update_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Add missing fields to quotes
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add updated_at trigger to quotes
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotes_update_updated_at ON public.quotes;
CREATE TRIGGER quotes_update_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION update_quotes_updated_at();

-- Add missing fields to wishlists
ALTER TABLE public.wishlists
ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sign_in_ip INET,
ADD COLUMN IF NOT EXISTS security_score INT DEFAULT 50;

-- Ensure user_sessions has all needed fields
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created ON public.orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id_created ON public.quotes(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id_added ON public.wishlists(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_created ON public.user_sessions(user_id, created_at DESC);
```

---

## 7. API Route for Security Event Logging

**File: `apps/portal/app/api/log-security-event/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, userAgent } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Get client IP from headers
    const ipAddress = request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") || 
      request.socket?.remoteAddress ||
      "unknown";

    // Insert security event
    const { error } = await supabase
      .from("user_security_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent || request.headers.get("user-agent"),
        details: {
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
      });

    if (error) {
      console.error("Security logging error:", error);
      return NextResponse.json(
        { error: "Failed to log security event" },
        { status: 500 }
      );
    }

    // Update last_sign_in_at on user_profiles
    await supabase
      .from("user_profiles")
      .update({
        last_sign_in_at: new Date().toISOString(),
        last_sign_in_ip: ipAddress,
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging security event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Implementation Checklist

### Phase 1: Database (Day 1)
- [ ] Run migration `20260202000001_dashboard_data_fixes.sql`
- [ ] Verify all new columns created
- [ ] Test indexes are created
- [ ] Verify existing data integrity

### Phase 2: Security Logging (Day 2)
- [ ] Create Edge Function `/log-security-event`
- [ ] Create API route `/app/api/log-security-event/route.ts`
- [ ] Test logging functionality
- [ ] Verify events appear in user_security_events table

### Phase 3: Dashboard Updates (Day 3-4)
- [ ] Add last session query
- [ ] Fix order stats calculation
- [ ] Expand order query with missing fields
- [ ] Expand quote query with missing fields
- [ ] Add security event logging call
- [ ] Add last sign-in display component

### Phase 4: Testing & Deployment (Day 5)
- [ ] Unit test all data queries
- [ ] Integration test dashboard load
- [ ] Test on mobile/tablet
- [ ] Performance test (load time < 2s)
- [ ] Security audit test
- [ ] Commit and deploy

---

## Success Verification

✅ **Last Sign-In:**
```
Dashboard shows: "Last login: Feb 1, 3:45 PM from Chrome (San Francisco, CA)"
```

✅ **Order Stats:**
```
Total Orders: 12 (exact count)
Total Spent: $4,532.50 (sum of all orders)
Pending: 2 (processing + pending)
Delivered: 10 (completed)
```

✅ **Security Events:**
```
Event logged to user_security_events for each dashboard access
✓ event_type: "dashboard_access"
✓ ip_address: captured
✓ user_agent: captured
✓ timestamp: precise
```

✅ **Data Freshness:**
```
Each data element shows last updated time:
"Orders updated 2 minutes ago"
"Profile updated 1 hour ago"
```

