# Configuration Guide

## Email Verification & Password Reset Setup

### 1. Database Tables

Run the SQL file to create the required tables:

```bash
# In Supabase Dashboard SQL Editor, or via CLI:
supabase db execute --file database/create_reset_tables.sql
```

Or manually run the SQL from `database/create_reset_tables.sql` in your Supabase Dashboard.

### 2. MailerSend API Key Configuration

Set the MailerSend API key as a Supabase Edge Function secret:

```bash
# For password reset (uses the new API key)
supabase secrets set MAILERSEND_API_KEY=mlsn.41d469ffa261437fecee8b6e2d500c180725336018564eb8fd6a495ca21c5c09

# Or if you want to use a different key for verification emails:
# (The code already has fallback keys, but setting secrets is recommended)
```

**Note:** The functions have fallback API keys hardcoded, but it's better to set them as secrets for security.

### 3. Sender Email Configuration

Update the sender email in these files:

**For Password Reset Emails:**
- File: `supabase/functions/send-reset-code/index.ts`
- Line ~141: Change `"info@curare.com"` to your verified MailerSend sender domain
- Example: `new Sender("noreply@yourdomain.com", "Curare")`

**For Email Verification:**
- File: `supabase/functions/send-verification-email/index.ts`
- Line ~100: Change the sender email to your verified MailerSend sender domain
- Example: `new Sender("noreply@yourdomain.com", "Curare")`

**Important:** The sender email must be verified in your MailerSend account and match a domain you own.

### 4. Site URL Configuration

Set the site URL for email links:

```bash
supabase secrets set SITE_URL=https://yourdomain.com
```

Or it will default to `http://localhost:5173` for development.

### 5. Deploy Edge Functions

After fixing the MailerSend import, deploy all functions:

```bash
supabase functions deploy send-reset-code
supabase functions deploy verify-reset-code
supabase functions deploy block-reset-device
supabase functions deploy check-blocked-email
supabase functions deploy send-verification-email
supabase functions deploy block-verification-link
```

### 6. Email Verification Configuration Summary

**Email Verification (New Signups):**
- Function: `send-verification-email`
- API Key: Uses `MAILERSEND_API_KEY` secret or fallback key
- Sender: Update in `send-verification-email/index.ts` line ~100
- Tables: `blocked_emails` (for "didn't sign up" blocking)

**Password Reset:**
- Function: `send-reset-code`
- API Key: Uses `MAILERSEND_API_KEY` secret or fallback key
- Sender: Update in `send-reset-code/index.ts` line ~141
- Tables: `reset_codes`, `blocked_reset_devices`

### 7. Testing

1. Test email verification by signing up a new account
2. Test password reset by clicking "Forgot password"
3. Test "isn't you" links in both email types
4. Verify emails are sent from your verified domain

### Troubleshooting

**If MailerSend import fails:**
- The functions now use `npm:mailersend@2.6.0` which should work with Supabase Edge Functions
- If issues persist, you may need to create a `deno.json` file in each function directory

**If emails don't send:**
- Check MailerSend API key is correct
- Verify sender email domain in MailerSend dashboard
- Check Supabase Edge Function logs for errors
- Ensure tables are created correctly
