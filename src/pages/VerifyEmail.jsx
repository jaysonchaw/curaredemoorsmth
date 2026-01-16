/**
 * Verify Email Page
 * 
 * This page handles email verification for NEW USER SIGNUPS ONLY.
 * It is NOT used for password reset verification.
 * 
 * Features:
 * - Verifies email using Supabase OTP verification
 * - Handles "didn't sign up" blocking (deletes unverified account)
 * - Auto-redirects to dashboard on success
 * - Shows appropriate error messages for invalid/expired links
 */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabaseService'
import { setSessionToken } from '../utils/cookieManager'
import { getInitialLightMode } from '../utils/lightModeInit'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')
  const type = searchParams.get('type') || 'signup'
  const block = searchParams.get('block') === 'true'
  
  const [isLightMode] = useState(getInitialLightMode)
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error', 'blocked'
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token || !userId) {
      setStatus('error')
      setError('Invalid verification link')
      setIsLoading(false)
      return
    }

    // Ensure this is only for signup verification, not password reset
    if (type !== 'signup') {
      setStatus('error')
      setError('This link is only for email verification. Please use the correct link.')
      setIsLoading(false)
      return
    }

    if (block) {
      // Handle "didn't sign up" - block the link
      handleBlockLink()
      return
    }

    // Verify the email (only for new signups)
    handleVerification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, block, type])

  const handleBlockLink = async () => {
    try {
      setIsLoading(true)
      
      // Verify this is a signup verification (not password reset)
      if (type !== 'signup') {
        setStatus('error')
        setError('This action is only available for new account signups.')
        setIsLoading(false)
        return
      }

      // Mark email as blocked (don't delete account - could be a typo)
      // Use Edge Function to mark email as blocked
      try {
        const { error: blockError } = await supabase.functions.invoke('block-verification-link', {
          body: { userId }
        })
        
        if (blockError) {
          console.error('Error blocking email:', blockError)
          setStatus('error')
          setError('Failed to block email. Please try again or contact support.')
          setIsLoading(false)
          return
        }

        setStatus('blocked')
        setIsLoading(false)
      } catch (invokeErr) {
        console.error('Error invoking block function:', invokeErr)
        setStatus('error')
        setError('Failed to block email. Please try again or contact support.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error blocking link:', err)
      setStatus('error')
      setError('An error occurred. Please try again or contact support.')
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    try {
      setIsLoading(true)

      // Ensure this is only for signup verification
      if (type !== 'signup') {
        setStatus('error')
        setError('This verification link is only for new account signups.')
        setIsLoading(false)
        return
      }

      // Decode the token
      const decodedToken = decodeURIComponent(token)

      // Verify the email using the token hash (signup type only)
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: decodedToken,
        type: 'signup'
      })

      if (verifyError) {
        // Check if user was already verified or account doesn't exist
        if (verifyError.message?.includes('already') || verifyError.message?.includes('expired') || verifyError.message?.includes('used')) {
          setStatus('error')
          setError('This verification link has already been used or has expired. Please sign in or request a new verification email.')
        } else if (verifyError.message?.includes('invalid') || verifyError.message?.includes('not found')) {
          setStatus('error')
          setError('Invalid verification link. The link may have been blocked or the account may have been deleted.')
        } else {
          setStatus('error')
          setError('Verification failed. Please check your email for the correct link or request a new verification email.')
        }
        setIsLoading(false)
        return
      }

      if (data?.session && data?.user) {
        // Successfully verified - save session and redirect
        setSessionToken(data.session.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setStatus('success')
        setTimeout(() => {
          navigate('/testsecurev2')
        }, 2000)
      } else {
        setStatus('error')
        setError('Verification completed but session could not be created. Please try signing in.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Verification error:', err)
      setStatus('error')
      setError(err.message || 'Verification failed. Please try again or contact support.')
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        input::placeholder {
          color: ${isLightMode ? '#d0d1d2' : '#3b4652'} !important;
          opacity: 1;
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}>
          {status === 'verifying' && (
            <>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                textAlign: 'center',
                margin: 0
              }}>
                Verifying Email...
              </h1>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                textAlign: 'center',
                margin: 0
              }}>
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                textAlign: 'center',
                margin: 0
              }}>
                Email Verified!
              </h1>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                textAlign: 'center',
                margin: 0
              }}>
                Your email has been verified successfully! Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                textAlign: 'center',
                margin: 0
              }}>
                Verification Failed
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center'
              }}>
                <img 
                  src="/warning.png" 
                  alt="Warning" 
                  style={{
                    width: '20px',
                    height: '20px',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '14px',
                  color: '#f73d35'
                }}>
                  {error || 'Invalid or expired verification link'}
                </span>
              </div>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Sign In
              </button>
            </>
          )}

          {status === 'blocked' && (
            <>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                textAlign: 'center',
                margin: 0
              }}>
                Email Blocked
              </h1>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                textAlign: 'center',
                margin: 0,
                maxWidth: '400px'
              }}>
                This email address has been marked as not wanting to receive verification emails. If this was a mistake, please contact support to unblock this email address.
              </p>
              <button
                onClick={() => navigate('/auth')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default VerifyEmail
