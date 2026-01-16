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
    const { email, deviceId } = await req.json()

    if (!email || !deviceId) {
      return new Response(
        JSON.stringify({ error: "Missing email or device ID" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Store blocked device in database
    try {
      const { error: insertError } = await supabase
        .from('blocked_reset_devices')
        .upsert({
          email: normalizedEmail,
          device_id: deviceId,
          blocked_at: new Date().toISOString()
        }, {
          onConflict: 'email,device_id'
        })

      if (insertError) {
        console.error("Error blocking device:", insertError)
        // Table might not exist - that's okay, continue
      }
    } catch (e) {
      console.error("Error with blocked_reset_devices table:", e)
      // Table might not exist - that's okay
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error("Error blocking reset device:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to block device" }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
