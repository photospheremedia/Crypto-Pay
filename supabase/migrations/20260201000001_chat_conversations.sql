-- Restaurant Hub Solution - Chat Conversations & Lead Capture
-- Stores chat conversations for lead tracking and support

-- ============================================
-- 1. CHAT CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (guest or authenticated)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  is_guest BOOLEAN DEFAULT TRUE,
  
  -- Conversation metadata
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Lead tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'converted', 'archived')),
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  lead_score INTEGER DEFAULT 0,
  interested_in TEXT[], -- Array of services they showed interest in
  
  -- Contact captured during chat
  contact_captured BOOLEAN DEFAULT FALSE,
  contact_captured_at TIMESTAMPTZ,
  
  -- Staff assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  
  -- Notes and follow-up
  internal_notes TEXT,
  follow_up_date DATE,
  follow_up_completed BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  message_count INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  landing_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- For detecting contact info shared
  contains_email BOOLEAN DEFAULT FALSE,
  contains_phone BOOLEAN DEFAULT FALSE,
  extracted_email TEXT,
  extracted_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_guest_email ON public.chat_conversations(guest_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_status ON public.chat_conversations(lead_status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_contact_captured ON public.chat_conversations(contact_captured) WHERE contact_captured = TRUE;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_follow_up ON public.chat_conversations(follow_up_date) WHERE follow_up_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ============================================
-- 4. TRIGGERS
-- ============================================
-- Update timestamp trigger
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at 
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-detect contact info in messages
CREATE OR REPLACE FUNCTION detect_contact_in_message()
RETURNS TRIGGER AS $$
DECLARE
  email_pattern TEXT := '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}';
  phone_pattern TEXT := '[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}';
  found_email TEXT;
  found_phone TEXT;
BEGIN
  -- Only check user messages
  IF NEW.role = 'user' THEN
    -- Extract email
    SELECT (regexp_match(NEW.content, email_pattern))[1] INTO found_email;
    IF found_email IS NOT NULL THEN
      NEW.contains_email := TRUE;
      NEW.extracted_email := found_email;
      
      -- Update conversation
      UPDATE public.chat_conversations
      SET 
        guest_email = COALESCE(guest_email, found_email),
        contact_captured = TRUE,
        contact_captured_at = COALESCE(contact_captured_at, NOW()),
        updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
    
    -- Extract phone (simplified pattern)
    SELECT (regexp_match(NEW.content, phone_pattern))[1] INTO found_phone;
    IF found_phone IS NOT NULL AND length(found_phone) >= 10 THEN
      NEW.contains_phone := TRUE;
      NEW.extracted_phone := found_phone;
      
      -- Update conversation
      UPDATE public.chat_conversations
      SET 
        guest_phone = COALESCE(guest_phone, found_phone),
        contact_captured = TRUE,
        contact_captured_at = COALESCE(contact_captured_at, NOW()),
        updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;
  
  -- Update message count
  UPDATE public.chat_conversations
  SET message_count = message_count + 1, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS detect_contact_trigger ON public.chat_messages;
CREATE TRIGGER detect_contact_trigger
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION detect_contact_in_message();

-- ============================================
-- 5. RLS POLICIES
-- ============================================
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see their own, admins can see all
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "System can insert conversations" ON public.chat_conversations;
CREATE POLICY "System can insert conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can update conversations" ON public.chat_conversations;
CREATE POLICY "Admins can update conversations" ON public.chat_conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'super_admin')
    )
  );

-- Messages: Same policy as conversations
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = conversation_id 
      AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'staff', 'super_admin')
      ))
    )
  );

DROP POLICY IF EXISTS "System can insert messages" ON public.chat_messages;
CREATE POLICY "System can insert messages" ON public.chat_messages
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- 6. VIEWS FOR DASHBOARD
-- ============================================
CREATE OR REPLACE VIEW public.chat_leads_summary AS
SELECT 
  c.id,
  c.session_id,
  COALESCE(c.guest_name, up.full_name, 'Anonymous') as name,
  COALESCE(c.guest_email, up.email) as email,
  c.guest_phone as phone,
  c.is_guest,
  c.status,
  c.lead_status,
  c.lead_score,
  c.interested_in,
  c.contact_captured,
  c.message_count,
  c.started_at,
  c.ended_at,
  c.assigned_to,
  assigned_user.full_name as assigned_to_name,
  c.internal_notes,
  c.follow_up_date,
  c.follow_up_completed,
  c.created_at,
  c.updated_at
FROM public.chat_conversations c
LEFT JOIN public.user_profiles up ON c.user_id = up.id
LEFT JOIN public.user_profiles assigned_user ON c.assigned_to = assigned_user.id
ORDER BY c.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.chat_leads_summary TO authenticated;

-- ============================================
-- 7. STATS FUNCTION FOR DASHBOARD
-- ============================================
CREATE OR REPLACE FUNCTION public.get_chat_leads_stats()
RETURNS TABLE (
  total BIGINT,
  new_leads BIGINT,
  contacted BIGINT,
  qualified BIGINT,
  converted BIGINT,
  lost BIGINT,
  with_contact BIGINT,
  today BIGINT,
  this_week BIGINT,
  pending_follow_up BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE lead_status = 'new')::BIGINT as new_leads,
    COUNT(*) FILTER (WHERE lead_status = 'contacted')::BIGINT as contacted,
    COUNT(*) FILTER (WHERE lead_status = 'qualified')::BIGINT as qualified,
    COUNT(*) FILTER (WHERE lead_status = 'converted')::BIGINT as converted,
    COUNT(*) FILTER (WHERE lead_status = 'lost')::BIGINT as lost,
    COUNT(*) FILTER (WHERE contact_captured = TRUE)::BIGINT as with_contact,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::BIGINT as today,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as this_week,
    COUNT(*) FILTER (WHERE follow_up_date IS NOT NULL AND follow_up_completed = FALSE AND follow_up_date <= CURRENT_DATE)::BIGINT as pending_follow_up
  FROM public.chat_conversations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
