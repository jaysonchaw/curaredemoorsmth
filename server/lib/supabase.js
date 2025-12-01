// Re-export Supabase client for server use
// In production, use server-side Supabase client with service role key
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://jkbtqodxnbptrvgosfka.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnRxb2R4bmJwdHJ2Z29zZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjYzNzAsImV4cCI6MjA3OTAwMjM3MH0.8kQU4SmTJRNxiSnookAPO0jIKeU68-NsNkqmgrKEbTg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = { supabase };

