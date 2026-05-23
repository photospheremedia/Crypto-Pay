# Google Cloud + Supabase Integration Summary

## ✅ What Was Set Up

### 1. **Service Accounts (Ready to Use)**
```
✅ restaurant-hub-ci@restaurant-hub-485622.iam.gserviceaccount.com
✅ restaurant-hub-vercel@restaurant-hub-485622.iam.gserviceaccount.com  
✅ restaurant-hub-backups@restaurant-hub-485622.iam.gserviceaccount.com
```

**Permissions Assigned:**
- CI/CD: `roles/logging.logWriter` (can write logs)
- Vercel: `roles/logging.viewer` (can read logs)
- Backups: `roles/logging.logWriter` (can write logs)

### 2. **Database Migration: Audit & Backup Logging**
New tables created in Supabase:
- `public.audit_logs` - Track all application events
- `public.backup_logs` - Track database backups
- Automated cleanup jobs (via pg_cron)

### 3. **Edge Function: audit-logger**
- Bridges Supabase audit logs with Google Cloud Logging
- Works with or without GCP billing
- Stores logs locally in Supabase (always available)
- Sends to GCP when `GOOGLE_CLOUD_SA_TOKEN` is configured

### 4. **Documentation**
- `docs/GOOGLE_CLOUD_INTEGRATION.md` - Full integration guide
- `gcloud-dashboard-config.json` - Monitoring dashboard config

---

## 🚀 How It Works (With or Without GCP Billing)

### Current State: **Supabase Native** ✅
```bash
# Your logs are always stored in Supabase
# View audit logs
supabase functions invoke audit-logger \
  --project-ref xfairwgarmpvbogiuduk

# Query directly in Supabase
select * from public.audit_logs 
where created_at > now() - interval '24 hours'
```

### When Billing is Enabled: **Dual Storage** 🚀
```bash
# Logs are stored in BOTH Supabase AND Google Cloud
# Set the environment variable
export GOOGLE_CLOUD_SA_TOKEN="<your-gcp-token>"

# Logs automatically sync to Google Cloud Logging
# Query in Google Cloud
gcloud logging read "severity >= ERROR" \
  --project=restaurant-hub-485622
```

---

## 📋 Setup Steps (In Order)

### Step 1: Deploy New Migration ✅ Ready
```bash
cd /Users/Wael/Projects/crypto-pay
supabase db push --project-ref xfairwgarmpvbogiuduk
# Creates audit_logs and backup_logs tables
```

### Step 2: Deploy Edge Function ✅ Ready
```bash
supabase functions deploy audit-logger \
  --project-ref xfairwgarmpvbogiuduk
```

### Step 3: Enable Billing (Optional but Recommended)
Go to: https://console.cloud.google.com/billing

Then run:
```bash
gcloud billing projects link restaurant-hub-485622 \
  --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### Step 4: Create GCP Service Account Key
```bash
gcloud iam service-accounts keys create restaurant-hub-ci-key.json \
  --iam-account=restaurant-hub-ci@restaurant-hub-485622.iam.gserviceaccount.com
```

### Step 5: Create Storage Buckets (Requires Billing)
```bash
gcloud storage buckets create gs://restaurant-hub-backups \
  --location=us-east1 --uniform-bucket-level-access
```

### Step 6: Set Up GitHub Actions Secrets
```bash
# Add to GitHub repository secrets
GOOGLE_CLOUD_PROJECT_ID=restaurant-hub-485622
GOOGLE_CLOUD_SA_KEY=$(cat restaurant-hub-ci-key.json)
SUPABASE_PROJECT_REF=xfairwgarmpvbogiuduk
SUPABASE_ACCESS_TOKEN=<your-token>
```

### Step 7: Deploy Monitoring (Requires Billing)
```bash
gcloud monitoring dashboards create \
  --config=@gcloud-dashboard-config.json \
  --project=restaurant-hub-485622
```

---

## 🔍 Using Audit Logs in Your Application

### Insert Audit Log from Your API
```typescript
// In your Next.js API route
import { getSupabaseServiceClient } from '@crypto-pay/db/supabaseServer'

export async function POST(req: Request) {
  const supabase = await getSupabaseServiceClient()
  
  // Log the action
  await supabase
    .from('audit_logs')
    .insert({
      event_type: 'order_created',
      severity: 'info',
      actor_id: userId,
      actor_email: user.email,
      resource_type: 'order',
      resource_id: orderId,
      description: `Order ${orderId} created by ${user.email}`,
      metadata: {
        amount: order.total,
        items_count: order.items.length,
        delivery_address: order.delivery_address,
      },
      status: 'success',
    })
  
  // Your actual API logic...
}
```

### Query Audit Logs
```sql
-- View all errors from past 24 hours
select * from public.audit_logs
where severity = 'error'
  and created_at > now() - interval '24 hours'
order by created_at desc;

-- Track user activity
select 
  actor_email,
  count(*) as action_count,
  array_agg(distinct event_type) as event_types
from public.audit_logs
where actor_id = 'USER_ID'
group by actor_email;

-- Monitor failed operations
select 
  event_type,
  resource_type,
  count(*) as failure_count,
  array_agg(error_message) as errors
from public.audit_logs
where status = 'failed'
  and created_at > now() - interval '7 days'
group by event_type, resource_type;
```

---

## 🔐 Security & Best Practices

### Service Account Keys
```bash
# ⚠️ NEVER commit these files
echo "*-key.json" >> .gitignore

# Store securely in:
# - GitHub Secrets (for CI/CD)
# - Vercel Environment Variables (encrypted)
# - Google Cloud Secret Manager
```

### RLS Policies for Audit Logs
Users can only view their own audit logs:
```sql
create policy "Users can view their own audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (actor_id = auth.uid());
```

Admins can view all:
```sql
where exists (
  select 1 from public.user_profiles
  where id = auth.uid() and role = 'rhs_admin'
)
```

---

## 📊 Monitoring Checklist

- [ ] Deploy audit_logs migration
- [ ] Deploy audit-logger edge function
- [ ] Enable billing on GCP
- [ ] Create service account keys
- [ ] Create Cloud Storage buckets
- [ ] Configure logging sinks
- [ ] Create monitoring dashboard
- [ ] Set up alert policies
- [ ] Add GitHub Actions secrets
- [ ] Test audit logging in application

---

## 🆘 Troubleshooting

### Audit logs not appearing?
```bash
# Check function logs
supabase functions invoke audit-logger \
  --project-ref xfairwgarmpvbogiuduk

# View edge function logs
supabase logs function-all --project-ref xfairwgarmpvbogiuduk
```

### GCP integration not working?
```bash
# Verify service account
gcloud iam service-accounts list --project=restaurant-hub-485622

# Check permissions
gcloud projects get-iam-policy restaurant-hub-485622 \
  --flatten=bindings[].members \
  --format='table(bindings.role)'
```

### Storage bucket not created?
```bash
# Check billing status
gcloud billing projects describe restaurant-hub-485622

# Enable service
gcloud services enable storage-api.googleapis.com \
  --project=restaurant-hub-485622
```

---

## 📚 Next Steps

1. **Deploy Migration** → Creates tables locally
2. **Deploy Function** → Edge function handles logging
3. **Enable Billing** → Unlock full GCP features
4. **Create Buckets** → Store exports and backups
5. **Configure Sinks** → Auto-export logs to BigQuery
6. **Set Alerts** → Get notified of errors

See `DEPLOYMENT.md` for complete CI/CD integration.
