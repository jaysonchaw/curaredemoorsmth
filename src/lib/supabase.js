import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkbtqodxnbptrvgosfka.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnRxb2R4bmJwdHJ2Z29zZmthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjYzNzAsImV4cCI6MjA3OTAwMjM3MH0.8kQU4SmTJRNxiSnookAPO0jIKeU68-NsNkqmgrKEbTg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

