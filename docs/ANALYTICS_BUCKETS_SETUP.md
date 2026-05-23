# Analytics Buckets Implementation Guide

**Status**: Private Alpha | **Access**: Request via form | **Created**: 2026-02-02  
**Purpose**: Time-series analytics, event tracking, data warehouse

## Overview

Analytics buckets use **Apache Iceberg** - an open-table format for large analytical datasets. Perfect for:
- Event tracking (orders, revenue, user actions)
- Real-time analytics dashboards
- Historical data analysis
- Multi-tenant reporting

## Prerequisites

### ✅ Analytics Bucket Created
Your analytics bucket has been successfully created in Supabase dashboard.

**S3 Connection Details**:
```
Endpoint: https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3
Region: us-east-1
Warehouse: analytics
```

**Access Keys** (Store securely in `.env.local`):
- Analytics Access Key: `6fed82842ac56074b2fd924c7fb43849`
- Vectors Access Key: `af95e172e18489d1b7e203bbf9c909d9b`
- Service Token: `SUPABASE_SERVICE_TOKEN_REDACTED`

**Iceberg Catalog**:
```
https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/iceberg
```

### Local Development Note
Local Supabase setup doesn't support analytics buckets. Testing requires a hosted project.

## Quick Start

### 1. Create Analytics Bucket via SDK

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'  // Must use service role
)

const { data, error } = await supabase.storage.analytics.createBucket('analytics')

if (error) {
  console.error('Failed to create analytics bucket:', error)
} else {
  console.log('✓ Analytics bucket created:', data)
}
```

### 2. Insert Event Data

```typescript
const analytics = supabase.storage.analytics.from('analytics')

// Track order placement event
await analytics.insert([
  {
    event_id: generateUUID(),
    event_type: 'order_placed',
    tenant_id: tenantId,
    user_id: userId,
    timestamp: new Date().toISOString(),
    data: {
      order_id: orderId,
      total_amount: 125.50,
      item_count: 3,
      delivery_time: 25,
      platform: 'mobile'
    }
  }
])
```

### 3. Query Data via Postgres

```typescript
// Analytics bucket is queryable via Postgres FDW (Foreign Data Wrapper)
const { data } = await supabase
  .from('analytics')  // Iceberg table mapped to Postgres
  .select(`
    event_type,
    count(*) as total_events,
    avg((data->>'total_amount')::numeric) as avg_amount,
    max((data->>'total_amount')::numeric) as max_amount
  `)
  .eq('tenant_id', tenantId)
  .gte('timestamp', thirtyDaysAgo)
  .group_by('event_type')

console.log(data)
// Output: Order analytics aggregated by event type
```

## Use Cases in Restaurant Hub

### Order Analytics

```typescript
// Log every order event
async function trackOrderEvent(order: Order, tenant: string) {
  const analytics = supabase.storage.analytics.from('analytics')
  
  await analytics.insert([{
    event_id: generateUUID(),
    event_type: 'order_placed',
    tenant_id: tenant,
    user_id: order.customer_id,
    timestamp: order.created_at,
    data: {
      order_id: order.id,
      total_amount: order.total,
      item_count: order.items.length,
      delivery_platform: order.platform,  // UberEats, DoorDash, etc.
      estimated_prep_time: order.prep_time,
      status_transitions: order.status_history
    }
  }])
}
```

### Revenue Reporting Dashboard

```typescript
// Real-time revenue metrics for restaurant operators
async function getDailyRevenueStats(tenant: string, date: Date) {
  const { data } = await supabase
    .from('analytics')
    .select(`
      count(*) as total_orders,
      sum((data->>'total_amount')::numeric) as daily_revenue,
      avg((data->>'total_amount')::numeric) as avg_order_value,
      array_agg(distinct (data->>'delivery_platform')) as platforms
    `)
    .eq('tenant_id', tenant)
    .eq('event_type', 'order_placed')
    .gte('timestamp', startOfDay(date))
    .lt('timestamp', startOfDay(addDays(date, 1)))
  
  return data[0]  // Single aggregated row
}
```

### Customer Behavior Analysis

```typescript
// Track customer actions for insights
async function trackCustomerAction(tenant: string, userId: string, action: string) {
  const analytics = supabase.storage.analytics.from('analytics')
  
  await analytics.insert([{
    event_id: generateUUID(),
    event_type: `customer_${action}`,  // customer_search, customer_browse, etc.
    tenant_id: tenant,
    user_id: userId,
    timestamp: new Date().toISOString(),
    data: {
      action_type: action,
      session_id: getCurrentSessionId(),
      device_type: getDeviceType(),
      referral_source: getReferralSource()
    }
  }])
}

// Analyze behavior patterns
async function getCustomerInsights(tenant: string) {
  const { data } = await supabase
    .from('analytics')
    .select(`
      event_type,
      count(*) as frequency,
      count(distinct user_id) as unique_users
    `)
    .eq('tenant_id', tenant)
    .like('event_type', 'customer_%')
    .group_by('event_type')
  
  return data
}
```

### Performance Monitoring

```typescript
// Track system performance metrics
async function logPerformanceMetric(tenant: string, metric: PerformanceMetric) {
  const analytics = supabase.storage.analytics.from('analytics')
  
  await analytics.insert([{
    event_id: generateUUID(),
    event_type: 'system_performance',
    tenant_id: tenant,
    timestamp: new Date().toISOString(),
    data: {
      metric_name: metric.name,
      value: metric.value,
      unit: metric.unit,
      endpoint: metric.endpoint,
      response_time_ms: metric.duration,
      status_code: metric.statusCode
    }
  }])
}
```

## Setup with Real-Time Replication

### Automatic Sync from Postgres

```typescript
// Set up change data capture (CDC) from your main tables
async function setupRealtimeReplication() {
  // This requires Postgres logical replication setup
  // Supabase handles this automatically with Analytics Buckets
  
  // Documents automatically synced to Iceberg:
  // - orders table → analytics/orders
  // - customers table → analytics/customers  
  // - payments table → analytics/payments
}
```

### Manual Periodic Sync

```typescript
// If automatic replication not enabled, manually snapshot data
async function syncOrdersToAnalytics(tenant: string) {
  // Get orders from main database
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('tenant_id', tenant)
    .gte('created_at', lastSyncTime)
  
  // Insert into analytics bucket
  const analytics = supabase.storage.analytics.from('analytics')
  await analytics.insert(
    orders.map(order => ({
      event_id: generateUUID(),
      event_type: 'order_snapshot',
      tenant_id: tenant,
      timestamp: order.created_at,
      data: order
    }))
  )
}
```

## Query Examples

### Top Performing Items

```typescript
const { data } = await supabase
  .from('analytics')
  .select(`
    event_type,
    data->>'item_name' as item,
    count(*) as orders,
    sum((data->>'item_price')::numeric * (data->>'quantity')::int) as revenue
  `)
  .eq('tenant_id', tenantId)
  .eq('event_type', 'order_item_purchased')
  .group_by('item')
  .order('revenue', { ascending: false })
  .limit(10)
```

### Peak Order Times

```typescript
const { data } = await supabase
  .from('analytics')
  .select(`
    date_trunc('hour', timestamp::timestamp) as hour,
    count(*) as order_count,
    avg((data->>'total_amount')::numeric) as avg_order
  `)
  .eq('tenant_id', tenantId)
  .eq('event_type', 'order_placed')
  .gte('timestamp', sevenDaysAgo)
  .group_by('hour')
  .order('hour')
```

### Multi-Platform Performance

```typescript
const { data } = await supabase
  .from('analytics')
  .select(`
    data->>'delivery_platform' as platform,
    count(*) as total_orders,
    avg((data->>'prep_time')::int) as avg_prep_time,
    sum((data->>'total_amount')::numeric) as total_revenue
  `)
  .eq('tenant_id', tenantId)
  .eq('event_type', 'order_placed')
  .group_by('platform')
```

## Best Practices

### Event Design
- **Naming**: Use clear, snake_case event types: `order_placed`, `payment_processed`
- **Metadata**: Include tenant isolation in every event
- **Timestamps**: Use ISO 8601 format, always include timezone
- **Data**: Store denormalized data (no joins needed)

### Storage Efficiency
```typescript
// ✅ GOOD: Denormalized for analytics
{
  event_type: 'order_placed',
  data: {
    customer_name: 'John Doe',
    restaurant_name: 'Taco Tuesday',
    items: 'Tacos x3, Burritos x2',
    total: 45.99
  }
}

// ❌ BAD: Normalized like production database
{
  event_type: 'order_placed',
  data: {
    customer_id: 'uuid',        // Would require joins
    restaurant_id: 'uuid',
    items: [{ item_id, qty }]   // Requires nested lookups
  }
}
```

### Partition Strategy
Analytics buckets automatically partition by date. Design events accordingly:
```typescript
// Partition by tenant + event_type for fast queries
{
  tenant_id: string,           // First level partition
  event_type: string,          // Second level partition
  timestamp: Date,             // Auto-partitioned by Iceberg
  data: { /* ... */ }
}
```

## Monitoring & Maintenance

### Track Data Volume

```typescript
// Monitor analytics bucket size
async function getAnalyticsBucketStats(tenant: string) {
  const { data } = await supabase
    .from('analytics')
    .select('count(*) as total_events', { count: 'exact' })
    .eq('tenant_id', tenant)
  
  console.log(`Total events: ${data.count}`)
}
```

### Archive Old Data

```typescript
// Iceberg supports time-travel - no need to delete
// But you can create retention policies
async function archiveOldAnalytics(tenant: string, olderThan: Date) {
  // Supabase automatically handles retention
  // Configure via dashboard or set up Apache Spark jobs
}
```

## Limits & Costs

| Aspect | Limit |
|--------|-------|
| Max namespaces | 5 per project |
| Max tables | 10 per namespace |
| Max catalogs | 2 per project |
| Data retention | Configurable (default: 90 days) |
| Query latency | < 5 seconds (typical) |

**Cost Model**: Charged per GB stored + per GB scanned in queries

## Troubleshooting

### "Analytics bucket not found"
```
Cause: Feature not enabled or access not granted
Fix: 
  1. Verify access form approved
  2. Wait 48 hours from submission
  3. Check Supabase dashboard - should show analytics in Storage
```

### "Dimension mismatch" errors
```
Cause: Data structure changed between inserts
Fix: 
  1. Ensure consistent metadata schema across events
  2. Use JSON schema validation before insert
  3. Test with small dataset first
```

## Next Steps

1. ⬜ Request access via https://forms.supabase.com/analytics-buckets
2. ⬜ Wait for approval (48 hours)
3. ⬜ Create analytics bucket via SDK
4. ⬜ Define event schema (orders, customers, payments)
5. ⬜ Implement event logging throughout app
6. ⬜ Build analytics queries and dashboards
7. ⬜ Set up real-time replication from Postgres

## Related

- [Supabase Analytics Buckets Docs](https://supabase.com/docs/guides/storage/analytics)
- [Apache Iceberg Docs](https://iceberg.apache.org/)
- [Postgres Foreign Data Wrapper](https://www.postgresql.org/docs/current/postgres-fdw.html)
