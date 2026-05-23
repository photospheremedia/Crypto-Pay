# Database Schema Deployment Guide

## Overview
This guide will help you deploy the comprehensive database schema to your Supabase project. The schema includes:
- User profiles and settings
- Organizations and multi-location support
- Orders and quotes management
- Delivery integrations
- Support ticketing system
- Activity logging

## Prerequisites
- Supabase project created (Project ID: xfairwgarmpvbogiuduk)
- Supabase account with admin access
- Database schema file: `/database-schema.sql`

## Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor**
   - Go to: https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/sql
   - Or navigate manually: Dashboard → Your Project → SQL Editor

2. **Create New Query**
   - Click "New query" button in the SQL Editor
   - This opens a blank SQL editor

3. **Copy Schema Content**
   - Open `/database-schema.sql` from the project root
   - Copy the entire file contents (471 lines)

4. **Paste and Execute**
   - Paste the schema into the SQL Editor
   - Click "Run" button (or press Cmd+Enter / Ctrl+Enter)
   - Wait for execution to complete (~5-10 seconds)

5. **Verify Success**
   - Check for "Success. No rows returned" message
   - Go to Table Editor to verify tables were created
   - Expected tables:
     - user_profiles
     - user_settings
     - organizations
     - organization_members
     - locations
     - orders
     - order_items
     - quotes
     - delivery_integrations
     - support_tickets
     - support_ticket_messages
     - activity_log

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd /Users/Wael/Projects/crypto-pay

# Login to Supabase (if not already logged in)
supabase login

# Link to your project
supabase link --project-ref xfairwgarmpvbogiuduk

# Run the migration
supabase db push database-schema.sql
```

### Option 3: Using psql directly

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string (Direct connection)

psql "postgresql://postgres:[YOUR-PASSWORD]@db.xfairwgarmpvbogiuduk.supabase.co:5432/postgres" -f database-schema.sql
```

## Post-Deployment Verification

### 1. Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output:
- activity_log
- delivery_integrations
- locations
- order_items
- orders
- organization_members
- organizations
- quotes
- support_ticket_messages
- support_tickets
- user_profiles
- user_settings

### 2. Verify RLS Policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Should see policies for all tables (users can only access their own data).

### 3. Test Triggers
```sql
-- Check that triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

Expected triggers:
- `update_*_updated_at` on multiple tables
- `on_auth_user_created` on auth.users

### 4. Test User Profile Creation

Create a test user and verify profile auto-creation:

```sql
-- This would normally happen through Supabase Auth
-- But you can verify the trigger exists:
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Testing the Schema

### Create a Test User via Application
1. Go to your application: http://localhost:3000
2. Sign up with a test email
3. Check that `user_profiles` and `user_settings` were automatically created

### Verify via SQL
```sql
-- Check if profile was created
SELECT id, company_name, business_type, created_at 
FROM user_profiles 
WHERE id = 'YOUR_USER_ID';

-- Check if settings were created
SELECT user_id, theme, language, currency 
FROM user_settings 
WHERE user_id = 'YOUR_USER_ID';
```

## Common Issues

### Issue 1: "relation already exists"
**Solution**: Tables already exist. Either:
- Drop existing tables first (CAUTION: This deletes data)
- Or modify schema to use `CREATE TABLE IF NOT EXISTS`

### Issue 2: "permission denied"
**Solution**: Make sure you're using an admin/service role key, not anon key.

### Issue 3: RLS prevents data access
**Solution**: RLS policies require authentication. Make sure:
- User is logged in via Supabase Auth
- User ID matches the auth.uid() in queries
- Using correct Supabase client with auth context

### Issue 4: Trigger doesn't fire
**Solution**: 
- Verify trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check trigger is on `auth.users` table
- Ensure function `handle_new_user()` exists

## Next Steps After Deployment

1. **Test User Registration**
   - Sign up a new user
   - Verify profile and settings are auto-created
   - Check user can access their data

2. **Test Settings Page**
   - Navigate to `/account/settings`
   - Update profile information
   - Change notification preferences
   - Verify changes persist

3. **Create Sample Data**
   - Create a test order
   - Request a test quote
   - Create a support ticket
   - Verify all relationships work correctly

4. **Monitor Activity Log**
   ```sql
   SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10;
   ```

5. **Set Up Database Backups**
   - Supabase automatically backs up your database
   - Configure backup retention in Dashboard → Settings → Database

## Schema Updates

To modify the schema later:

1. **Add New Columns**
   ```sql
   ALTER TABLE user_profiles ADD COLUMN new_field TEXT;
   ```

2. **Create New Tables**
   - Follow existing patterns with RLS policies
   - Add triggers for updated_at if needed
   - Create indexes for performance

3. **Modify RLS Policies**
   ```sql
   DROP POLICY IF EXISTS "policy_name" ON table_name;
   CREATE POLICY "new_policy_name" ON table_name ...;
   ```

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs → Postgres Logs
2. Review RLS policies if data access fails
3. Verify auth context with `SELECT auth.uid()`
4. Check table permissions in Table Editor

## Security Notes

- All tables have RLS enabled by default
- Users can only access their own data via auth.uid()
- Service role key bypasses RLS (use carefully)
- Anon key respects RLS policies
- Activity log tracks all important actions for audit trail
