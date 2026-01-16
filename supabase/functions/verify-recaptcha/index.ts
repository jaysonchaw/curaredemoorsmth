// Verify reCAPTCHA v3 token
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY')

serve(async (req) => {
  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing reCAPTCHA token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!RECAPTCHA_SECRET_KEY) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify token with Google
    const verifyResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      console.error('reCAPTCHA verification failed:', verifyData['error-codes'])
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification failed', details: verifyData['error-codes'] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Check score (v3 returns a score from 0.0 to 1.0)
    // Lower scores indicate bot-like behavior
    const score = verifyData.score || 0
    if (score < 0.5) {
      console.warn('reCAPTCHA score too low:', score)
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA score too low', score }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, score }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
