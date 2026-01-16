import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseService'
import { setSessionToken, getUserAge } from '../utils/cookieManager'
import { setProgress } from '../services/progressService'

const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          
          // Check if we're in a popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'SUPABASE_AUTH_ERROR',
              error: error.message
            }, window.location.origin)
            window.close()
          } else {
            navigate('/auth?error=auth_failed')
          }
          return
        }

        if (session) {
          // Save session to cookie and localStorage
          setSessionToken(session.access_token)
          localStorage.setItem('user', JSON.stringify(session.user))
          
          // Set password to email if user signed up with Google (no password set)
          // This allows them to sign in with email+password later using their email as password
          // If they reset password later, it will change this password (not their actual Gmail password)
          try {
            // Check if user was created via OAuth (app_metadata.provider === 'google')
            const isGoogleUser = session.user.app_metadata?.provider === 'google'
            
            if (isGoogleUser) {
              // Try to set password to email address
              // This will work if user doesn't have a password, or will update existing password
              const { error: updateError } = await supabase.auth.updateUser({
                password: session.user.email
              })
              
              if (updateError) {
                // If update fails, user might already have a different password set
                // That's fine - they can use password reset to change it
                console.error('Note: Could not set default password for Google user:', updateError.message)
              }
            }
          } catch (e) {
            // Silently fail - password setting is optional
            console.error('Error setting password for Google user:', e)
          }
          
          // Check if user already exists (has completed onboarding before)
          const { data: existingUser } = await supabase
            .from('users')
            .select('has_completed_onboarding, onboarding_responses')
            .eq('id', session.user.id)
            .single()
          
          // Save welcome responses if they exist (from onboarding before account creation)
          // BUT only if: 1) user is NOT a minor (<13), and 2) user doesn't already exist
          const welcomeResponses = sessionStorage.getItem('welcomeResponses')
          const userAge = getUserAge()
          const isMinor = userAge !== null && userAge < 13
          const userAlreadyExists = existingUser?.has_completed_onboarding === true
          
          if (welcomeResponses && session.user.id && !isMinor && !userAlreadyExists) {
            try {
              const responses = JSON.parse(welcomeResponses)
              // Update user record with onboarding responses
              await supabase
                .from('users')
                .update({
                  onboarding_responses: responses,
                  has_completed_onboarding: true
                })
                .eq('id', session.user.id)
              
              // Clear welcome responses from sessionStorage after saving
              sessionStorage.removeItem('welcomeResponses')
            } catch (e) {
              console.error('Error saving welcome responses:', e)
            }
          } else if (welcomeResponses) {
            // Clear welcome responses if we're not saving them
            sessionStorage.removeItem('welcomeResponses')
          }
          
          // Check if we're in a popup
          if (window.opener) {
            // Notify parent window of success
            window.opener.postMessage({
              type: 'SUPABASE_AUTH_SUCCESS',
              session: session
            }, window.location.origin)
            window.close()
          } else {
            // Not in popup, redirect normally
            navigate('/testsecurev2')
          }
        } else {
          // Check if we're in a popup
          if (window.opener) {
            window.opener.postMessage({
              type: 'SUPABASE_AUTH_ERROR',
              error: 'No session found'
            }, window.location.origin)
            window.close()
          } else {
            navigate('/auth')
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        
        // Check if we're in a popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'SUPABASE_AUTH_ERROR',
            error: err.message || 'Authentication failed'
          }, window.location.origin)
          window.close()
        } else {
          navigate('/auth?error=auth_failed')
        }
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: "'Inter Tight', sans-serif",
      color: '#ffffff'
    }}>
      Completing sign in...
    </div>
  )
}

export default AuthCallback
