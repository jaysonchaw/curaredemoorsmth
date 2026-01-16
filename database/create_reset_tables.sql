-- Create reset_codes table for password reset functionality
CREATE TABLE IF NOT EXISTS reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  hashed_code TEXT NOT NULL,
  code_timestamp TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  reset_token TEXT,
  reset_expires_at TIMESTAMPTZ,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reset_codes_email ON reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_reset_codes_email_verified ON reset_codes(email, verified);
CREATE INDEX IF NOT EXISTS idx_reset_codes_reset_token ON reset_codes(reset_token) WHERE reset_token IS NOT NULL;

-- Create blocked_reset_devices table for device blocking
CREATE TABLE IF NOT EXISTS blocked_reset_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, device_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_reset_devices_email_device ON blocked_reset_devices(email, device_id);

-- Create blocked_emails table for email verification blocking
CREATE TABLE IF NOT EXISTS blocked_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blocked_emails_email ON blocked_emails(email);

-- Add RLS policies (optional, adjust based on your security needs)
-- For reset_codes: Only allow service role to access
ALTER TABLE reset_codes ENABLE ROW LEVEL SECURITY;

-- For blocked_reset_devices: Only allow service role to access
ALTER TABLE blocked_reset_devices ENABLE ROW LEVEL SECURITY;

-- For blocked_emails: Only allow service role to access
ALTER TABLE blocked_emails ENABLE ROW LEVEL SECURITY;
