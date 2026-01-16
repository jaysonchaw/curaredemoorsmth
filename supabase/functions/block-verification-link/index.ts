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
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Check if user exists and is unverified (new signup)
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId)

    if (getUserError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Only allow blocking for unverified users (new signups)
    if (userData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "Cannot block verified account" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Mark the email as blocked in user metadata (don't delete account)
    // This prevents future verification emails to this address
    const email = userData.user.email
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        email_blocked: true,
        email_blocked_at: new Date().toISOString()
      }
    })

    if (updateError) {
      console.error("Error blocking email:", updateError)
      return new Response(
        JSON.stringify({ error: "Failed to block email" }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Also store blocked email in a separate table for easy lookup
    // This allows checking blocked emails during signup
    try {
      const { error: insertError } = await supabase
        .from('blocked_emails')
        .upsert({
          email: email.toLowerCase(),
          blocked_at: new Date().toISOString(),
          user_id: userId
        }, {
          onConflict: 'email'
        })

      if (insertError) {
        console.error("Error storing blocked email:", insertError)
        // Don't fail - metadata update succeeded
      }
    } catch (e) {
      console.error("Error with blocked_emails table:", e)
      // Table might not exist - that's okay, metadata is enough
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error("Error blocking verification link:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to block verification link" }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
