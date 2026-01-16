/**
 * Clean Authentication Service
 * Handles all authentication via Supabase
 * No caching, no complex state - just direct Supabase calls
 */

import { createClient } from '@supabase/supabase-js'
import { setSessionToken, removeSessionToken, getSessionToken } from '../utils/cookieManager'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Single Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-jkbtqodxnbptrvgosfka-auth-token'
  }
})

/**
 * Get current user ID from Supabase session
 * Returns null if not authenticated
 */
export const getUserId = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('[authService] getUserId error:', error)
        return null
      }
      if (!session) {
        return null
      }
      return session.user.id
  } catch (error) {
    console.error('[authService] getUserId exception:', error)
    return null
  }
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, recaptchaToken) => {
  try {
    // Verify reCAPTCHA if provided
    if (recaptchaToken) {
      const { error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      })
      if (recaptchaError) {
        throw new Error('reCAPTCHA verification failed')
      }
    }

    // Check if email is blocked (user clicked "didn't sign up" before)
    // Use Edge Function to check blocked emails (handles table existence gracefully)
    try {
      const { data: blockedData, error: blockedCheckError } = await supabase.functions.invoke('check-blocked-email', {
        body: { email: email.toLowerCase() }
      })

      if (!blockedCheckError && blockedData?.blocked) {
        throw new Error('This email address cannot receive verification emails. If this was a mistake, please contact support.')
      }
    } catch (checkErr) {
      // If the error message indicates blocked email, throw it
      if (checkErr.message?.includes('cannot receive verification emails')) {
        throw checkErr
      }
      // If check fails for other reasons, continue anyway (table might not exist yet)
      console.warn('Could not check blocked emails:', checkErr)
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) throw error

    // EMAIL VERIFICATION FOR NEW SIGNUPS ONLY
    // If user was created but not auto-confirmed (new signup), send verification email via MailerSend
    // This is ONLY for new account signups - NOT for password resets or existing users
    if (data.user && !data.session && !data.user.email_confirmed_at) {
      try {
        // Generate a signup confirmation link for NEW users only
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'signup',
          email: email
        })

        if (!linkError && linkData) {
          // Extract token hash from the generated link
          let token = ''
          
          // Try to get token from properties
          if (linkData.properties?.hashed_token) {
            token = linkData.properties.hashed_token
          } else if (linkData.properties?.action_link) {
            // Parse the action link to extract token
            try {
              const url = new URL(linkData.properties.action_link)
              token = url.searchParams.get('token_hash') || 
                      url.hash.split('token_hash=')[1]?.split('&')[0] || 
                      url.hash.split('#token_hash=')[1]?.split('&')[0] || ''
            } catch (e) {
              // If URL parsing fails, try to extract from string
              const match = linkData.properties.action_link.match(/token_hash=([^&]+)/)
              token = match ? match[1] : ''
            }
          }
          
          if (token) {
            // Send verification email via MailerSend (only for new signups)
            const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
              body: {
                email: email,
                userId: data.user.id,
                token: token
              }
            })

            if (emailError) {
              console.error('Failed to send verification email:', emailError)
              // Don't throw - user is still created, they can request resend
            }
          } else {
            console.warn('Could not extract token from verification link')
          }
        }
      } catch (emailErr) {
        console.error('Error sending verification email:', emailErr)
        // Don't throw - user is still created, they can request resend
      }
    }

    // Save session if available (auto-confirmed accounts)
    if (data.session) {
      setSessionToken(data.session.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    return { user: null, session: null, error: error.message }
  }
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Save session
    if (data.session) {
      setSessionToken(data.session.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    return { user: null, session: null, error: error.message }
  }
}

/**
 * Sign in with Google (popup)
 */
export const signInWithGoogle = async () => {
  return new Promise(async (resolve, reject) => {
    let popup = null
    let checkClosed = null
    
    const cleanup = () => {
      if (checkClosed) clearInterval(checkClosed)
      if (popup && !popup.closed) popup.close()
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true
        }
      })

      if (error || !data?.url) {
        reject(error || new Error('No OAuth URL received'))
        return
      }

      // Open popup
      popup = window.open(
        data.url,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes,left=' + 
        (window.screenX + (window.outerWidth / 2) - 250) + 
        ',top=' + (window.screenY + (window.outerHeight / 2) - 300)
      )

      if (!popup || popup.closed) {
        reject(new Error('Popup was blocked'))
        return
      }

      // Listen for messages
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return

        if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
          cleanup()
          window.removeEventListener('message', handleMessage)
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError || !session) {
            reject(sessionError || new Error('No session found'))
            return
          }

          setSessionToken(session.access_token)
          localStorage.setItem('user', JSON.stringify(session.user))
          resolve({ session, user: session.user, error: null })
        } else if (event.data?.type === 'SUPABASE_AUTH_ERROR') {
          cleanup()
          window.removeEventListener('message', handleMessage)
          reject(new Error(event.data.error || 'Authentication failed'))
        }
      }

      window.addEventListener('message', handleMessage)

      // Check if popup closed
      checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup()
          window.removeEventListener('message', handleMessage)
          resolve({ session: null, user: null, error: null })
        }
      }, 500)

    } catch (error) {
      cleanup()
      reject(error)
    }
  })
}

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const userId = await getUserId()
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Clear session
    removeSessionToken()
    localStorage.removeItem('user')
    
    // Clear user progress from localStorage
    if (userId) {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(`user_${userId}_`)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }

    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

/**
 * Get current session
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error) {
    return { session: null, error: error.message }
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = getSessionToken()
  if (!token || token === 'skip_token') return false
  
  const { session } = await getSession()
  return !!session
}

/**
 * Password reset functions (keep existing)
 */
export const sendResetCode = async (email, recaptchaToken) => {
  try {
    // Generate device ID for blocking functionality
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = crypto.randomUUID()
      localStorage.setItem('device_id', deviceId)
    }

    const { data, error } = await supabase.functions.invoke('send-reset-code', {
      body: { email, deviceId }
    })
    
    if (error) throw error
    if (data?.error) return { data: null, error: data.error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message || 'Failed to send reset code' }
  }
}

export const verifyResetCode = async (email, code) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-reset-code', {
      body: { email, code }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const resetPasswordWithToken = async (token, email, password) => {
  try {
    const { data, error } = await supabase.functions.invoke('reset-password', {
      body: { token, email, password }
    })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}
