import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getSessionToken, removeSessionToken } from '../utils/cookieManager'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { signUpWithEmail, signInWithEmail, signInWithGoogle, sendResetCode } from '../services/supabaseService'
import { setProgress } from '../services/progressService'
import { verifyAdminCode, setAdminAuthenticated } from '../utils/adminAuth'

const AuthPage = () => {
  const navigate = useNavigate()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const [isLightMode, setIsLightMode] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    // Detect browser light/dark mode preference (same as Welcome page)
    const checkTheme = () => {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
      setIsLightMode(prefersLight)
    }

    checkTheme()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    mediaQuery.addEventListener('change', checkTheme)

    // Clear skip token and navigation flag when auth page loads (on refresh)
    const token = getSessionToken()
    if (token === 'skip_token') {
      removeSessionToken()
      localStorage.removeItem('user')
    }
    sessionStorage.removeItem('skip_navigated')

    // Prevent inspection - keyboard shortcuts
    const preventKeyShortcuts = (e) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault()
        return false
      }
    }

    // Prevent right-click
    const preventRightClick = (e) => {
      if (e.button === 2) {
        e.preventDefault()
        return false
      }
    }

    // Prevent context menu
    const preventContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    // Prevent text selection (but allow in input fields and textareas)
    const preventSelect = (e) => {
      const target = e.target
      const tagName = target.tagName?.toLowerCase()
      const isEditable = tagName === 'input' || tagName === 'textarea' || target.isContentEditable
      if (!isEditable) {
        e.preventDefault()
      }
    }

    // Add event listeners
    document.addEventListener('keydown', preventKeyShortcuts)
    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('mousedown', preventRightClick)
    document.addEventListener('selectstart', preventSelect)

    return () => {
      mediaQuery.removeEventListener('change', checkTheme)
      document.removeEventListener('keydown', preventKeyShortcuts)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('mousedown', preventRightClick)
      document.removeEventListener('selectstart', preventSelect)
    }
  }, [])

  // Don't auto-redirect - let users access auth page even if authenticated

  // Signup state
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordError, setSignupPasswordError] = useState('')
  const [signupEmailError, setSignupEmailError] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginEmailError, setLoginEmailError] = useState('')
  const [loginPasswordError, setLoginPasswordError] = useState('')

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [googleHover, setGoogleHover] = useState(false)
  const [googlePressed, setGooglePressed] = useState(false)
  const [appleHover, setAppleHover] = useState(false)
  const [applePressed, setApplePressed] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordEmailError, setForgotPasswordEmailError] = useState('')
  const [forgotPasswordButtonHover, setForgotPasswordButtonHover] = useState(false)
  const [forgotPasswordButtonPressed, setForgotPasswordButtonPressed] = useState(false)

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check if signup fields are valid
  const isSignupValid = () => {
    return isValidEmail(signupEmail) && signupPassword.length >= 8
  }

  // Check if login fields are valid
  const isLoginValid = () => {
    return isValidEmail(loginEmail) && loginPassword.length >= 8
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setSignupPasswordError('')
    setSignupEmailError('')

    // Check if email contains admin code FIRST - bypass all validation
    if (signupEmail && verifyAdminCode(signupEmail.trim())) {
      setAdminAuthenticated()
      navigate('/admin', { replace: true })
      return
    }

    // Only validate if admin code is not present
    if (!signupEmail || !signupPassword) {
      if (!signupEmail) {
        setSignupEmailError('Please fill in all required fields')
      }
      if (!signupPassword) {
        setSignupPasswordError('Please fill in all required fields')
      }
      return
    }

    if (!isValidEmail(signupEmail)) {
      setSignupEmailError('Please enter a valid email.')
      return
    }

    if (signupPassword.length < 8) {
      setSignupPasswordError('Your password has to have more than 8 characters.')
      return
    }

    setIsLoading(true)

    try {
      // Get reCAPTCHA token
      let recaptchaToken = null
      if (executeRecaptcha) {
        recaptchaToken = await executeRecaptcha('signup')
      }

      const { user, error } = await signUpWithEmail(signupEmail, signupPassword, recaptchaToken)
      
      if (error) {
        // Check if it's a reCAPTCHA error
        if (error.toLowerCase().includes('recaptcha')) {
          setError('reCAPTCHA verification failed. Please try again.')
        } else if (error.toLowerCase().includes('email') || error.toLowerCase().includes('already')) {
          setSignupEmailError(error)
        } else if (error.toLowerCase().includes('password')) {
          setSignupPasswordError(error)
        } else {
          setError(error)
        }
        return
      }

      // If email confirmation is required (new signup), show message
      if (user && !user.email_confirmed_at) {
        // Don't highlight fields for this - it's a success message, just informational
        setError('Please check your email to verify your account. We\'ve sent you a verification link to complete your signup.')
        return
      }

      // If auto-confirmed, save onboarding data and navigate to app
      if (user) {
        // Save onboarding data from sessionStorage to account if it exists
        const welcomeResponses = sessionStorage.getItem('welcomeResponses')
        if (welcomeResponses) {
          try {
            const responses = JSON.parse(welcomeResponses)
            
            // Save onboarding responses to user account
            if (responses.age) {
              await setProgress('onboarding_age', String(responses.age))
            }
            if (responses.selectedOption) {
              await setProgress('onboarding_option1', String(responses.selectedOption))
            }
            if (responses.selectedOption2) {
              await setProgress('onboarding_option2', String(responses.selectedOption2))
            }
            if (responses.selectedOption3) {
              await setProgress('onboarding_option3', String(responses.selectedOption3))
            }
            if (responses.selectedOption4) {
              await setProgress('onboarding_option4', String(responses.selectedOption4))
            }
            
            // Clear sessionStorage after saving
            sessionStorage.removeItem('welcomeResponses')
          } catch (e) {
            console.error('Error saving onboarding data:', e)
          }
        }
        
        navigate('/testsecurev2')
      }
    } catch (err) {
      const errorMessage = err.message || 'Signup failed'
      // Check if it's a reCAPTCHA error
      if (errorMessage.toLowerCase().includes('recaptcha')) {
        setError('reCAPTCHA verification failed. Please try again.')
      } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (errorMessage.toLowerCase().includes('server')) {
        setError('Server error. Please try again later.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setForgotPasswordEmailError('')

    if (!forgotPasswordEmail) {
      setForgotPasswordEmailError('Please enter your email address')
      return
    }

    if (!isValidEmail(forgotPasswordEmail)) {
      setForgotPasswordEmailError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const { data, error: resetError } = await sendResetCode(forgotPasswordEmail)
      
      if (resetError) {
        // Check error type and display appropriately
        if (resetError.toLowerCase().includes('network') || resetError.toLowerCase().includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else if (resetError.toLowerCase().includes('technical') || resetError.toLowerCase().includes('server')) {
          setError('Technical error. Please try again later.')
        } else {
          setError(resetError)
        }
        return
      }

      // Success - redirect to verify code page
      navigate(`/verify-code?email=${encodeURIComponent(forgotPasswordEmail)}`)
    } catch (err) {
      const errorMessage = err.message || 'Failed to send password reset email'
      // Check error type and display appropriately
      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (errorMessage.toLowerCase().includes('technical') || errorMessage.toLowerCase().includes('server')) {
        setError('Technical error. Please try again later.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoginEmailError('')
    setLoginPasswordError('')

    if (!loginEmail || !loginPassword) {
      setLoginEmailError('Please fill in all required fields')
      setLoginPasswordError('Please fill in all required fields')
      return
    }

    if (!isValidEmail(loginEmail)) {
      setLoginEmailError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await signInWithEmail(loginEmail, loginPassword)
      
      if (error) {
        // Check if it's a technical error (network, server errors, etc.)
        const technicalErrors = ['network', 'fetch', 'timeout', 'connection', 'server error', 'internal error']
        const isTechnicalError = technicalErrors.some(techError => 
          error.toLowerCase().includes(techError)
        )
        
        if (isTechnicalError) {
          setError(error)
        } else {
          setLoginEmailError("That email or password doesn't look right.")
          setLoginPasswordError("That email or password doesn't look right.")
        }
        return
      }

      if (user) {
        // Save onboarding data from sessionStorage to account if it exists (only if user doesn't exist)
        const welcomeResponses = sessionStorage.getItem('welcomeResponses')
        if (welcomeResponses) {
          try {
            const responses = JSON.parse(welcomeResponses)
            
            // Save onboarding responses to user account
            if (responses.age) {
              await setProgress('onboarding_age', String(responses.age))
            }
            if (responses.selectedOption) {
              await setProgress('onboarding_option1', String(responses.selectedOption))
            }
            if (responses.selectedOption2) {
              await setProgress('onboarding_option2', String(responses.selectedOption2))
            }
            if (responses.selectedOption3) {
              await setProgress('onboarding_option3', String(responses.selectedOption3))
            }
            if (responses.selectedOption4) {
              await setProgress('onboarding_option4', String(responses.selectedOption4))
            }
            
            // Clear sessionStorage after saving
            sessionStorage.removeItem('welcomeResponses')
          } catch (e) {
            console.error('Error saving onboarding data:', e)
          }
        }
        
        navigate('/testsecurev2')
      }
    } catch (err) {
      // Check if it's a technical error
      const technicalErrors = ['network', 'fetch', 'timeout', 'connection', 'server error', 'internal error']
      const isTechnicalError = technicalErrors.some(techError => 
        err.message?.toLowerCase().includes(techError)
      )
      
      if (isTechnicalError) {
        setError(err.message || 'Login failed')
      } else {
        setLoginEmailError("That email or password doesn't look right.")
        setLoginPasswordError("That email or password doesn't look right.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      setError('')
      const { session, user, error } = await signInWithGoogle()
      if (error) {
        setError(error)
      } else if (session && user) {
        // Set password to email if user signed up with Google (no password set)
        // This allows them to sign in with email+password later using their email as password
        // If they reset password later, it will change this password (not their actual Gmail password)
        try {
          // Check if user was created via OAuth (app_metadata.provider === 'google')
          const isGoogleUser = user.app_metadata?.provider === 'google'
          
          if (isGoogleUser) {
            // Try to set password to email address
            // This will work if user doesn't have a password, or will update existing password
            const { error: updateError } = await supabase.auth.updateUser({
              password: user.email
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
        
        // Save onboarding data from sessionStorage to account if it exists
        const welcomeResponses = sessionStorage.getItem('welcomeResponses')
        if (welcomeResponses) {
          try {
            const responses = JSON.parse(welcomeResponses)
            
            // Save onboarding responses to user account
            if (responses.age) {
              await setProgress('onboarding_age', String(responses.age))
            }
            if (responses.selectedOption) {
              await setProgress('onboarding_option1', String(responses.selectedOption))
            }
            if (responses.selectedOption2) {
              await setProgress('onboarding_option2', String(responses.selectedOption2))
            }
            if (responses.selectedOption3) {
              await setProgress('onboarding_option3', String(responses.selectedOption3))
            }
            if (responses.selectedOption4) {
              await setProgress('onboarding_option4', String(responses.selectedOption4))
            }
            
            // Clear sessionStorage after saving
            sessionStorage.removeItem('welcomeResponses')
          } catch (e) {
            console.error('Error saving onboarding data:', e)
          }
        }
        
        // Successfully authenticated, redirect to main app
        navigate('/testsecurev2')
      }
      // If no session/user and no error, user likely cancelled - silently handle
    } catch (err) {
      // Only show error if it's not a cancellation
      if (err.message && !err.message.includes('cancelled')) {
        const errorMessage = err.message || 'Google signup failed'
        if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else if (errorMessage.toLowerCase().includes('server')) {
          setError('Server error. Please try again later.')
        } else {
          setError(errorMessage)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }


  if (showForgotPassword) {
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
          gap: '32px',
          marginTop: '80px'
        }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            textAlign: 'center',
            margin: 0
          }}>
            Reset Password
          </h1>

          <form onSubmit={handleForgotPassword} style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <input
                  type="text"
                  value={forgotPasswordEmail}
                  onChange={(e) => {
                    setForgotPasswordEmail(e.target.value)
                    setError('')
                    setForgotPasswordEmailError('')
                  }}
                  onFocus={() => setFocusedInput('forgotPasswordEmail')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Email"
                  required
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: `2pt solid ${forgotPasswordEmailError || error ? '#f73d35' : (focusedInput === 'forgotPasswordEmail' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                    backgroundColor: (forgotPasswordEmailError || error) ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                    color: isLightMode ? '#111827' : '#f9fafb',
                    fontSize: '16px',
                    fontFamily: "'Inter Tight', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
                {(forgotPasswordEmailError || error) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '8px'
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
                      {forgotPasswordEmailError || error}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => !isLoading && setForgotPasswordButtonHover(true)}
                onMouseLeave={() => {
                  setForgotPasswordButtonHover(false)
                  setForgotPasswordButtonPressed(false)
                }}
                onMouseDown={() => !isLoading && setForgotPasswordButtonPressed(true)}
                onMouseUp={() => setForgotPasswordButtonPressed(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  flexShrink: 0,
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={
                    forgotPasswordButtonPressed
                      ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                      : forgotPasswordButtonHover
                      ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                      : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                  }
                  alt="Send Reset Link"
                  style={{
                    height: '56px',
                    width: 'auto',
                    maxHeight: '56px',
                    maxWidth: '150px',
                    display: 'block'
                  }}
                />
              </button>
            </div>

            <p
              onClick={() => {
                setShowForgotPassword(false)
                setForgotPasswordEmail('')
                setError('')
              }}
              style={{
                marginTop: '8px',
                textAlign: 'center',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                cursor: 'pointer'
              }}
            >
              Back to Sign In
            </p>
          </form>
        </div>
      </div>
      </>
    )
  }

  if (showLogin) {
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
        justifyContent: 'flex-start',
        padding: '40px 20px',
        paddingTop: '120px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '450px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px'
        }}>
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            textAlign: 'center',
            margin: 0
          }}>
            Sign in to continue learning
          </h1>

          <form onSubmit={handleLogin} style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <input
                type="text"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value)
                  if (loginEmailError) setLoginEmailError('')
                }}
                onFocus={() => setFocusedInput('loginEmail')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Email"
                required
                style={{
                  width: '100%',
                  height: '56px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: `2pt solid ${loginEmailError ? '#f73d35' : (focusedInput === 'loginEmail' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                  backgroundColor: loginEmailError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                  color: isLightMode ? '#111827' : '#f9fafb',
                  fontSize: '16px',
                  fontFamily: "'Inter Tight', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              {loginEmailError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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
                    {loginEmailError}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value)
                    if (loginPasswordError) setLoginPasswordError('')
                  }}
                  onFocus={() => setFocusedInput('loginPassword')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Password"
                  required
                  style={{
                    flex: 1,
                    height: '56px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: `2pt solid ${loginPasswordError ? '#f73d35' : (focusedInput === 'loginPassword' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                    backgroundColor: loginPasswordError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                    color: isLightMode ? '#111827' : '#f9fafb',
                    fontSize: '16px',
                    fontFamily: "'Inter Tight', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  onMouseEnter={() => !isLoading && setSignupHover(true)}
                  onMouseLeave={() => {
                    setSignupHover(false)
                    setSignupPressed(false)
                  }}
                  onMouseDown={() => !isLoading && setSignupPressed(true)}
                  onMouseUp={() => setSignupPressed(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    flexShrink: 0,
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                <img
                  src={
                    signupPressed
                      ? isLoginValid()
                        ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                        : isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                      : signupHover
                      ? isLoginValid()
                        ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                        : isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                      : isLoginValid()
                      ? isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg'
                      : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                  }
                  alt="Sign In"
                    style={{
                      height: '56px',
                      width: 'auto',
                      maxHeight: '56px',
                      maxWidth: '150px',
                      display: 'block'
                    }}
                  />
                </button>
              </div>
              {loginPasswordError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
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
                    {loginPasswordError}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
                  {error}
                </span>
              </div>
            )}

            {/* Forgot password */}
            <p 
              onClick={() => {
                setShowForgotPassword(true)
                setForgotPasswordEmail(loginEmail)
              }}
              style={{
                marginTop: '8px',
                textAlign: 'center',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                cursor: 'pointer'
              }}
            >
              Forgot password?
            </p>

            {/* OR separator */}
            <div style={{
              position: 'relative',
              width: '100%',
              margin: '2px 0',
              marginTop: '12px'
            }}>
              <div style={{
                height: '1px',
                backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
                width: '100%'
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
                padding: '0 16px'
              }}>
                <span style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isLightMode ? '#d0d1d2' : '#3b4652'
                }}>
                  OR
                </span>
              </div>
            </div>

            {/* Two buttons side by side */}
            <div style={{
              display: 'flex',
              gap: '0px',
              width: '100%',
              marginTop: '-16px'
            }}>
              <button
                type="button"
                onClick={handleGoogleSignup}
                onMouseEnter={() => setGoogleHover(true)}
                onMouseLeave={() => {
                  setGoogleHover(false)
                  setGooglePressed(false)
                }}
                onMouseDown={() => setGooglePressed(true)}
                onMouseUp={() => setGooglePressed(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={googlePressed ? (isLightMode ? '/googlepressed(light).svg' : '/googlepressed.svg') : googleHover ? (isLightMode ? '/googlehover(light).svg' : '/googlehover.svg') : (isLightMode ? '/googledefault(light).svg' : '/googledefault.svg')}
                  alt="Google"
                  style={{
                    height: '56px',
                    width: 'auto',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    WebkitUserDrag: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </button>
              <button
                type="button"
                onMouseEnter={() => setAppleHover(true)}
                onMouseLeave={() => {
                  setAppleHover(false)
                  setApplePressed(false)
                }}
                onMouseDown={() => setApplePressed(true)}
                onMouseUp={() => setApplePressed(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={applePressed ? (isLightMode ? '/apple*pressed(light).svg' : '/apple*pressed.svg') : appleHover ? (isLightMode ? '/apple*hover(light).svg' : '/apple*hover.svg') : (isLightMode ? '/apple*default(light).svg' : '/apple*default.svg')}
                  alt="Apple"
                  style={{
                    height: '56px',
                    width: 'auto'
                  }}
                />
              </button>
            </div>
          </form>

          <p style={{
            marginTop: '38px',
            textAlign: 'center',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '14px',
            color: isLightMode ? '#6b7280' : '#9ca3af'
          }}>
            Don't have an account?{' '}
            <button
              onClick={() => setShowLogin(false)}
              style={{
                background: 'none',
                border: 'none',
                color: isLightMode ? '#000000' : '#ffffff',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        input::placeholder {
          color: ${isLightMode ? '#d0d1d2' : '#3b4652'} !important;
          opacity: 1;
        }
        /* reCAPTCHA badge is hidden globally in index.css */
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '40px 20px',
      paddingTop: '120px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px'
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '32px',
          fontWeight: 700,
          color: isLightMode ? '#000000' : '#ffffff',
          textAlign: 'center',
          margin: 0
        }}>
          Track your progress across lessons
        </h1>

        {/* Form */}
        <form onSubmit={handleSignup} noValidate style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              value={signupEmail}
              onChange={(e) => {
                setSignupEmail(e.target.value)
                setSignupEmailError('')
              }}
              onFocus={() => setFocusedInput('signupEmail')}
              onBlur={() => setFocusedInput(null)}
              placeholder="Email"
              required
              style={{
                width: '100%',
                height: '56px',
                padding: '0 16px',
                borderRadius: '8px',
                border: `2pt solid ${signupEmailError ? '#f73d35' : (focusedInput === 'signupEmail' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                backgroundColor: signupEmailError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                color: isLightMode ? '#111827' : '#f9fafb',
                fontSize: '16px',
                fontFamily: "'Inter Tight', sans-serif",
                outline: 'none',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                boxSizing: 'border-box'
              }}
            />
            {signupEmailError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px'
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
                  {signupEmailError}
                </span>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value)
                  setSignupPasswordError('')
                }}
                onFocus={() => setFocusedInput('signupPassword')}
                onBlur={() => setFocusedInput(null)}
                placeholder="Password"
                required={!verifyAdminCode(signupEmail?.trim() || '')}
                formNoValidate={verifyAdminCode(signupEmail?.trim() || '')}
                style={{
                  width: '100%',
                  height: '56px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: `2pt solid ${signupPasswordError ? '#f73d35' : (focusedInput === 'signupPassword' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                  backgroundColor: signupPasswordError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                  color: isLightMode ? '#111827' : '#f9fafb',
                  fontSize: '16px',
                  fontFamily: "'Inter Tight', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              {signupPasswordError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px'
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
                    {signupPasswordError}
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault()
                  return false
                }
                // Allow click, but handleSignup will validate
              }}
              onMouseEnter={() => !isLoading && setSignupHover(true)}
              onMouseLeave={() => {
                setSignupHover(false)
                setSignupPressed(false)
              }}
              onMouseDown={() => !isLoading && setSignupPressed(true)}
              onMouseUp={() => setSignupPressed(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                flexShrink: 0,
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={
                  signupPressed
                    ? isSignupValid()
                      ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                      : isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover
                    ? isSignupValid()
                      ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                      : isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isSignupValid()
                    ? isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                }
                alt="Sign Up"
                style={{
                  height: '56px',
                  width: 'auto',
                  maxHeight: '56px',
                  maxWidth: '150px',
                  display: 'block',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  WebkitUserDrag: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </button>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
                {error}
              </span>
            </div>
          )}

          {/* OR separator */}
          <div style={{
            position: 'relative',
            width: '100%',
            margin: '2px 0',
            marginTop: '22px'
          }}>
            <div style={{
              height: '1px',
              backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
              width: '100%'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
              padding: '0 16px'
            }}>
              <span style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                color: isLightMode ? '#d0d1d2' : '#3b4652'
              }}>
                OR
              </span>
            </div>
          </div>

          {/* Two buttons side by side */}
          <div style={{
            display: 'flex',
            gap: '0px',
            width: '100%',
            marginTop: '-6px'
          }}>
            <button
              type="button"
              onClick={handleGoogleSignup}
              onMouseEnter={() => setGoogleHover(true)}
              onMouseLeave={() => {
                setGoogleHover(false)
                setGooglePressed(false)
              }}
              onMouseDown={() => setGooglePressed(true)}
              onMouseUp={() => setGooglePressed(false)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={googlePressed ? (isLightMode ? '/googlepressed(light).svg' : '/googlepressed.svg') : googleHover ? (isLightMode ? '/googlehover(light).svg' : '/googlehover.svg') : (isLightMode ? '/googledefault(light).svg' : '/googledefault.svg')}
                alt="Google"
                style={{
                  height: '56px',
                  width: 'auto',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  WebkitUserDrag: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </button>
            <button
              type="button"
              onMouseEnter={() => setAppleHover(true)}
              onMouseLeave={() => {
                setAppleHover(false)
                setApplePressed(false)
              }}
              onMouseDown={() => setApplePressed(true)}
              onMouseUp={() => setApplePressed(false)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={applePressed ? (isLightMode ? '/apple*pressed(light).svg' : '/apple*pressed.svg') : appleHover ? (isLightMode ? '/apple*hover(light).svg' : '/apple*hover.svg') : (isLightMode ? '/apple*default(light).svg' : '/apple*default.svg')}
                alt="Apple"
                style={{
                  height: '56px',
                  width: 'auto',
                  userSelect: 'none',
                  pointerEvents: 'none',
                  WebkitUserDrag: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </button>
          </div>

          {/* Terms and Privacy Policy text */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              color: isLightMode ? '#6b7280' : '#9ca3af',
              margin: 0,
              lineHeight: '1.5'
            }}>
              By signing up, you agree to our{' '}
              <Link 
                to="/terms-of-service" 
                target="_blank"
                style={{
                  color: '#2563ebff',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Terms
              </Link>
              {' '}and{' '}
              <Link 
                to="/privacy-policy" 
                target="_blank"
                style={{
                  color: '#2563ebff',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              color: isLightMode ? '#6b7280' : '#9ca3af',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Google's{' '}
              <a 
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#2563ebff',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Privacy Policy
              </a>
              {' '}and{' '}
              <a 
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#2563ebff',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Terms of Service
              </a>
              {' '}apply.
            </p>
          </div>
        </form>

        {/* Already have account text */}
        <p style={{
          marginTop: '38px',
          textAlign: 'center',
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '14px',
          color: isLightMode ? '#6b7280' : '#9ca3af'
        }}>
          Already have an account?{' '}
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: 'none',
              border: 'none',
              color: isLightMode ? '#000000' : '#ffffff',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
    </>
  )
}

export default AuthPage
