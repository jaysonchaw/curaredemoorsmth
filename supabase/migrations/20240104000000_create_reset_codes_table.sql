-- Create reset_codes table for password reset flow
CREATE TABLE IF NOT EXISTS reset_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  hashed_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_reset_codes_email ON reset_codes(email);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_reset_codes_expires_at ON reset_codes(expires_at);

-- Enable Row Level Security
ALTER TABLE reset_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (Edge Functions use service role)
CREATE POLICY "Service role can manage reset codes"
ON reset_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

