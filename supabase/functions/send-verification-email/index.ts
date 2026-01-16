/**
 * Send Verification Email Edge Function
 * 
 * This function sends email verification emails via MailerSend for NEW USER SIGNUPS ONLY.
 * It is NOT used for password resets or existing user verification.
 * 
 * Requirements:
 * - MAILERSEND_API_KEY environment variable (or uses default token)
 * - SITE_URL environment variable (or defaults to localhost:5173)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { MailerSend, EmailParams, Sender, Recipient } from "npm:mailersend@2.6.0"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const MAILERSEND_API_KEY = Deno.env.get("MAILERSEND_API_KEY") || "mlsn.0b8b17cda1be8f9516d56123991f8e20da8b4e013c28afd764ea557925996f8f"

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
    const { email, userId, token } = await req.json()

    if (!email || !userId || !token) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Verify this is for a new signup (not password reset)
    // Check if user exists and is unverified
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId)
    
    if (getUserError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Only send verification email for unverified new signups
    if (userData.user.email_confirmed_at) {
      return new Response(
        JSON.stringify({ error: "User already verified" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Check if email is blocked (user clicked "didn't sign up" before)
    if (userData.user.user_metadata?.email_blocked === true) {
      return new Response(
        JSON.stringify({ error: "Email address is blocked from receiving verification emails" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Also check blocked_emails table
    try {
      const { data: blockedCheck, error: blockedError } = await supabase
        .from('blocked_emails')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (!blockedError && blockedCheck) {
        return new Response(
          JSON.stringify({ error: "Email address is blocked from receiving verification emails" }),
          { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        )
      }
    } catch (e) {
      // Table might not exist - that's okay, continue
    }

    // Get site URL from request or use default
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173"
    
    // Create verification link for NEW USER SIGNUP ONLY
    // The token should be used with verifyOtp (type: signup)
    const verifyLink = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}&userId=${userId}&type=signup`
    const blockLink = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}&userId=${userId}&type=signup&block=true`

    // Create email content
    const sentFrom = new Sender("info@curare.com", "Curare")
    const recipients = [new Recipient(email, "User")]

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
              Verify Your Email
            </h1>
            
            <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0;">
              Thanks for signing up! Please verify your email address to complete your account setup.
            </p>
            
            <div style="margin: 32px 0;">
              <a href="${verifyLink}" 
                 style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verifyLink}" style="color: #2563eb; word-break: break-all;">${verifyLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">
              Didn't sign up for Curare?
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
              <a href="${blockLink}" style="color: #dc2626; text-decoration: underline;">
                Click here to report this email
              </a>
            </p>
          </div>
        </body>
      </html>
    `

    const emailText = `
Verify Your Email

Thanks for signing up! Please verify your email address to complete your account setup.

Verify your email by clicking this link:
${verifyLink}

Didn't sign up for Curare?
Report this email: ${blockLink}
    `

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject("Verify Your Curare Account")
      .setHtml(emailHtml)
      .setText(emailText)

    const result = await mailerSend.email.send(emailParams)

    return new Response(
      JSON.stringify({ success: true, messageId: result.body?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  } catch (error) {
    console.error("Error sending verification email:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send verification email" }),
      { 
        status: 500, 
        headers: { ...corsHeaders(), "Content-Type": "application/json" } 
      }
    )
  }
})
