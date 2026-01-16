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
    const { email, resetToken, newPassword } = await req.json()

    if (!email || !resetToken || !newPassword) {
      return new Response("Missing fields", { status: 400 })
    }

    if (newPassword.length < 6) {
      return new Response("Password too short", { status: 400 })
    }

    const { data, error } = await supabase
      .from("reset_codes")
      .select("*")
      .eq("email", email)
      .eq("reset_token", resetToken)
      .single()

    if (error || !data) {
      return new Response("Invalid token", { status: 401 })
    }

    if (new Date(data.reset_expires_at) < new Date()) {
      return new Response("Token expired", { status: 401 })
    }

    // Get user ID from auth
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserByEmail(email)

    if (userError || !userData?.user) {
      return new Response("User not found", { status: 404 })
    }

    // Update password - this automatically invalidates all existing sessions
    // All devices will be logged out when they try to refresh their tokens
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { password: newPassword }
    )

    if (updateError) {
      return new Response("Failed to update password", { status: 500 })
    }

    // Password updated - all existing sessions are now invalid
    // Users will be logged out on all devices on next token refresh

    // Delete reset record so it can't be reused
    await supabase
      .from("reset_codes")
      .delete()
      .eq("id", data.id)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error(err)
    return new Response("Internal error", { status: 500 })
  }
})

