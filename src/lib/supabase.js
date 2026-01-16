// Re-export the SINGLE Supabase client from the service
// DO NOT create a new client here - this prevents "Multiple GoTrueClient instances" errors
export { supabase } from '../services/supabaseService'

