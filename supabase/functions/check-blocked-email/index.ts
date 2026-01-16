import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check user metadata for blocked email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (!listError && users?.users) {
      const user = users.users.find(u => u.email?.toLowerCase() === normalizedEmail)
      if (user?.user_metadata?.email_blocked === true) {
        return new Response(
          JSON.stringify({ blocked: true }),
          { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        )
      }
    }

    // Also check blocked_emails table
    try {
      const { data: blockedCheck, error: blockedError } = await supabase
        .from('blocked_emails')
        .select('email')
        .eq('email', normalizedEmail)
        .single()

      if (!blockedError && blockedCheck) {
        return new Response(
          JSON.stringify({ blocked: true }),
          { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        )
      }
    } catch (e) {
      // Table might not exist - that's okay
    }

    return new Response(
      JSON.stringify({ blocked: false }),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error checking blocked email:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to check blocked email" }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
