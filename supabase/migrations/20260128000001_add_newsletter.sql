-- Newsletter Subscribers Table
-- Track email subscriptions for marketing automation

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email (unique per list)
  email TEXT NOT NULL,
  
  -- Link to user if they have an account
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Subscriber info
  first_name TEXT,
  company_name TEXT,
  
  -- Subscription details
  list_type TEXT DEFAULT 'weekly_ops_brief' CHECK (list_type IN (
    'weekly_ops_brief',
    'product_updates', 
    'industry_insights',
    'promotions',
    'all'
  )),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  
  -- Tracking
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'footer', 'popup', 'signup', 'checkout', 'import')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  
  -- Unsubscribe tracking
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  
  -- Engagement metrics (updated by email service)
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  last_email_opened_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint per email per list
  UNIQUE(email, list_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_list ON public.newsletter_subscribers(list_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON public.newsletter_subscribers(created_at);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Service role can manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Service role can manage subscribers" ON public.newsletter_subscribers
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_newsletter_updated_at 
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- UPDATE LEADS TABLE - Add newsletter consent
-- ============================================
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS how_heard_about_us TEXT,
ADD COLUMN IF NOT EXISTS estimated_locations INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- ============================================
-- UPDATE USER PROFILES - Add marketing preferences
-- ============================================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS how_heard_about_us TEXT,
ADD COLUMN IF NOT EXISTS estimated_locations INTEGER DEFAULT 1;

-- ============================================
-- ANALYTICS VIEW FOR NEWSLETTER
-- ============================================
CREATE OR REPLACE VIEW public.newsletter_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as subscribe_date,
  list_type,
  source,
  status,
  COUNT(*) as subscriber_count,
  COUNT(CASE WHEN confirmed = true THEN 1 END) as confirmed_count,
  SUM(emails_sent) as total_emails_sent,
  SUM(emails_opened) as total_emails_opened,
  SUM(emails_clicked) as total_emails_clicked
FROM public.newsletter_subscribers
GROUP BY DATE_TRUNC('day', created_at), list_type, source, status
ORDER BY subscribe_date DESC;

GRANT SELECT ON public.newsletter_analytics TO authenticated;
