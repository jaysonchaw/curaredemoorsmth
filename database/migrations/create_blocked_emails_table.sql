-- Create blocked_emails table to track emails that cannot receive verification emails
-- This is used when users click "didn't sign up" - prevents future verification emails to that address

CREATE TABLE IF NOT EXISTS blocked_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_blocked_emails_email ON blocked_emails(email);

-- Add RLS policies (optional - adjust based on your security needs)
ALTER TABLE blocked_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can read/write (for Edge Functions)
CREATE POLICY "Service role can manage blocked emails"
  ON blocked_emails
  FOR ALL
  USING (auth.role() = 'service_role');
