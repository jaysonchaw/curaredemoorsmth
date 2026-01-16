/**
 * Send Password Reset Code Edge Function
 * 
 * Generates a secure 6-digit code and sends it via MailerSend.
 * Includes "isn't you" blocking functionality.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { MailerSend, EmailParams, Sender, Recipient } from "npm:mailersend@2.6.0"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const MAILERSEND_API_KEY = Deno.env.get("MAILERSEND_API_KEY") || "mlsn.41d469ffa261437fecee8b6e2d500c180725336018564eb8fd6a495ca21c5c09"

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)

const mailerSend = new MailerSend({
  apiKey: MAILERSEND_API_KEY,
})

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

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if email exists in Supabase Auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError || !users?.users) {
      return new Response(
        JSON.stringify({ error: "Technical error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === normalizedEmail)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "No account found with this email address." }),
        { status: 404, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Check if this device is blocked from sending reset emails to this account
    if (deviceId) {
      try {
        const { data: blockedDevice, error: blockedError } = await supabase
          .from('blocked_reset_devices')
          .select('device_id')
          .eq('email', normalizedEmail)
          .eq('device_id', deviceId)
          .single()

        if (!blockedError && blockedDevice) {
          return new Response(
            JSON.stringify({ error: "This device cannot send password reset emails to this account." }),
            { status: 403, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
          )
        }
      } catch (e) {
        // Table might not exist - continue
      }
    }

    // Generate secure 6-digit code
    // Use crypto.getRandomValues for secure random generation
    const codeArray = new Uint8Array(6)
    crypto.getRandomValues(codeArray)
    const code = Array.from(codeArray)
      .map(num => (num % 10).toString())
      .join('')

    // Create a timestamp for this code generation
    const codeTimestamp = new Date().toISOString()
    
    // Hash the code with email and timestamp for secure storage
    const encoder = new TextEncoder()
    const hashInput = code + normalizedEmail + codeTimestamp
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(hashInput)
    )
    const codeHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    // Store code in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    const { error: insertError } = await supabase
      .from('reset_codes')
      .insert({
        email: normalizedEmail,
        hashed_code: codeHash,
        code_timestamp: codeTimestamp, // Store timestamp for verification
        expires_at: expiresAt,
        attempts: 0,
        verified: false,
        user_id: user.id,
        created_at: codeTimestamp // Also store in created_at for fallback verification
      })

    if (insertError) {
      console.error("Error storing reset code:", insertError)
      return new Response(
        JSON.stringify({ error: "Technical error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Get site URL
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173"
    
    // Create "isn't you" block link
    const blockLink = `${siteUrl}/block-reset-device?email=${encodeURIComponent(normalizedEmail)}&deviceId=${encodeURIComponent(deviceId || 'unknown')}`

    // Send email via MailerSend
    const sentFrom = new Sender("info@curare.com", "Curare")
    const recipients = [new Recipient(normalizedEmail, "User")]

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #e5e7eb;">
            <h1 style="font-family: 'Unbounded', sans-serif; font-size: 24px; font-weight: 700; color: #000000; margin: 0 0 24px 0;">
              Reset Your Password
            </h1>
            
            <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
              We received a request to reset your password. Use the code below to continue:
            </p>
            
            <div style="margin: 32px 0; text-align: center;">
              <div style="display: inline-block; background-color: #f3f4f6; border: 2px solid #2563eb; border-radius: 8px; padding: 20px 40px;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600;">Your reset code:</p>
                <h2 style="font-family: 'Inter Tight', sans-serif; font-size: 36px; font-weight: 700; color: #2563eb; margin: 0; letter-spacing: 8px;">
                  ${code}
                </h2>
              </div>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0;">
              This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">
              Didn't request a password reset?
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              <a href="${blockLink}" style="color: #dc2626; text-decoration: underline;">
                Click here to block this device from sending reset emails
              </a>
            </p>
          </div>
        </body>
      </html>
    `

    const emailText = `
Reset Your Password

We received a request to reset your password. Use the code below to continue:

Your reset code: ${code}

This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.

Didn't request a password reset?
Block this device: ${blockLink}
    `

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Reset Your Curare Password")
      .setHtml(emailHtml)
      .setText(emailText)

    try {
      const result = await mailerSend.email.send(emailParams)

      return new Response(
        JSON.stringify({ success: true, messageId: result.body?.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders(), "Content-Type": "application/json" } 
        }
      )
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      // Clean up the code if email fails
      await supabase
        .from('reset_codes')
        .delete()
        .eq('email', normalizedEmail)
        .eq('hashed_code', codeHash)
      
      return new Response(
        JSON.stringify({ error: "Failed to send email. Please try again later." }),
        { 
          status: 500, 
          headers: { ...corsHeaders(), "Content-Type": "application/json" } 
        }
      )
    }
  } catch (error) {
    console.error("Error in send-reset-code:", error)
    return new Response(
      JSON.stringify({ error: "Technical error. Please try again later." }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
