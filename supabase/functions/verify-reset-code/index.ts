/**
 * Verify Password Reset Code Edge Function
 * 
 * Verifies the 6-digit code and returns a reset token.
 */
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
    const { email, code } = await req.json()

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code required" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const codeString = code.toString().replace(/\D/g, '').slice(0, 6)

    if (codeString.length !== 6) {
      return new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Get the most recent reset code for this email
    const { data: resetCodes, error: fetchError } = await supabase
      .from("reset_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)

    if (fetchError || !resetCodes || resetCodes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const resetCodeData = resetCodes[0]

    // Check if code is expired
    if (new Date(resetCodeData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Code has expired. Please request a new one." }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Check attempts (max 5 attempts)
    if (resetCodeData.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Verify code by hashing and comparing with stored hash
    // Use the timestamp that was stored when code was created
    const codeTimestamp = resetCodeData.code_timestamp || resetCodeData.created_at
    const encoder = new TextEncoder()
    const hashInput = codeString + normalizedEmail + codeTimestamp
    const testHash = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(hashInput)
    )
    const testHashString = Array.from(new Uint8Array(testHash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    // Compare hashes
    if (testHashString !== resetCodeData.hashed_code) {
      // Increment attempts
      await supabase
        .from("reset_codes")
        .update({ attempts: resetCodeData.attempts + 1 })
        .eq("id", resetCodeData.id)

      return new Response(
        JSON.stringify({ error: "Invalid code. Please try again." }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Code is valid - generate reset token
    const resetToken = crypto.randomUUID()
    const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // Mark code as verified and store reset token
    await supabase
      .from("reset_codes")
      .update({
        verified: true,
        reset_token: resetToken,
        reset_expires_at: tokenExpiry,
      })
      .eq("id", resetCodeData.id)

    return new Response(
      JSON.stringify({ success: true, token: resetToken }),
      { 
        status: 200, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error("Error in verify-reset-code:", error)
    return new Response(
      JSON.stringify({ error: "Technical error. Please try again later." }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
