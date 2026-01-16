/**
 * Legacy wrapper - redirects to new authService
 * Kept for backward compatibility with existing imports
 */

// Re-export supabase client from authService
export { supabase } from './authService'

// Re-export all auth functions
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOut,
  getSession,
  isAuthenticated,
  sendResetCode,
  verifyResetCode,
  resetPasswordWithToken,
  getUserId
} from './authService'

// Legacy getCurrentUser (wraps new one)
import { getUserId } from './authService'
import { supabase } from './authService'

export const getCurrentUser = async () => {
  try {
    const userId = await getUserId()
    if (!userId) return { user: null, error: null }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Legacy onAuthStateChange
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// Legacy resetPassword (forgot password)
export const resetPassword = async (email, recaptchaToken) => {
  try {
    if (recaptchaToken) {
      const { error: recaptchaError } = await supabase.functions.invoke('verify-recaptcha', {
        body: { token: recaptchaToken }
      })
      if (recaptchaError) {
        throw new Error('reCAPTCHA verification failed')
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}
