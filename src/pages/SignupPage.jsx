import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SplitText from '../components/reactbits/SplitText'
import Navigation from '../components/Navigation'

const SignupPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Get from URL params first, then try localStorage as fallback
  let accessCode = searchParams.get('accessCode')
  let uli = searchParams.get('uli')
  let group = searchParams.get('group')
  
  // If missing from URL, try localStorage (for Google OAuth flow)
  if ((!accessCode || !uli || !group)) {
    const storedData = localStorage.getItem('curare_signup_data')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        accessCode = accessCode || data.accessCode
        uli = uli || data.uli
        group = group || data.group
      } catch (e) {
        console.error('Error parsing stored signup data:', e)
      }
    }
  }

  const [activeTab, setActiveTab] = useState('signup')
  
  // Signup state
  const [signupNameOrEmail, setSignupNameOrEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [birthday, setBirthday] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentConsent, setParentConsent] = useState(false)
  const [tosConsent, setTosConsent] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  
  // Login state
  const [loginNameOrEmail, setLoginNameOrEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Check for error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'missing_uli_group':
          setError('Missing access code or ULI. Please enter them again.')
          break
        case 'missing_data':
          setError('Some required information is missing. Please try signing up again.')
          break
        case 'uli_already_used':
          setError('This ULI has already been used. Please contact support if you believe this is an error.')
          break
        case 'user_creation_failed':
          setError('Failed to create your account. Please try again or contact support.')
          break
        case 'auth_failed':
          setError('Authentication failed. Please try again.')
          break
        default:
          setError('An error occurred. Please try again.')
      }
    }
  }, [searchParams])

  const isUnder18 = () => {
    if (!birthday) return false
    const birthDate = new Date(birthday)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 18
    }
    return age < 18
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!signupNameOrEmail || !signupPassword || !birthday) {
      setError('Please fill in all required fields')
      return
    }

    if (isUnder18() && (!parentEmail || !parentConsent)) {
      setError('Parent email and consent are required for users under 18')
      return
    }

    if (!tosConsent) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return
    }

    setIsLoading(true)

    // Store signup data in localStorage to preserve it through email verification
    localStorage.setItem('curare_signup_data', JSON.stringify({
      accessCode: accessCode,
      uli: uli,
      group: group,
      birthday: birthday || '',
      parentEmail: parentEmail || '',
      parentConsent
    }))

    try {
      // Determine if input is email or name
      const isEmail = signupNameOrEmail.includes('@')
      const email = isEmail ? signupNameOrEmail : `${signupNameOrEmail.replace(/\s+/g, '').toLowerCase()}@curare.local`
      const fullName = isEmail ? '' : signupNameOrEmail

      // Sign up with email/password
      // Always use the user's email/name for the account, not the parent email
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email, // Always use the user's email, not parent email
        password: signupPassword,
        options: {
          data: {
            full_name: fullName,
            birthday: birthday,
            parent_email: isUnder18() ? parentEmail : null, // Parent email only for verification
            uli: uli,
            group_number: parseInt(group),
            parent_consent: parentConsent,
            access_code: accessCode
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) throw signUpError

      // If user is under 18, send a separate verification email to parent
      // The main account email will also receive a verification email
      if (isUnder18() && parentEmail) {
        // Note: Supabase will send verification to the account email (email variable)
        // We can't send a separate email to parent through Supabase auth,
        // but the parent email is stored in metadata for reference
      }

      // Check if email confirmation is required
      // If authData.user is null, it means email confirmation is required
      if (!authData.user) {
        // Email confirmation required - show success message
        setSignupSuccess(true)
      } else {
        // No email confirmation required - user is already signed in
        // Redirect to callback to create user record
        navigate('/auth/callback')
      }
    } catch (err) {
      console.error('Signup error:', err)
      localStorage.removeItem('curare_signup_data')
      setError(err.message || 'An error occurred during signup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Determine if input is email or name
      const isEmail = loginNameOrEmail.includes('@')
      const email = isEmail ? loginNameOrEmail : `${loginNameOrEmail.replace(/\s+/g, '').toLowerCase()}@curare.local`

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: loginPassword,
      })

      if (loginError) throw loginError

      // Check if user has completed intro
      const { data: userData } = await supabase
        .from('users')
        .select('has_completed_intro')
        .eq('id', data.user.id)
        .single()

      if (userData && !userData.has_completed_intro) {
        navigate('/introduction')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    // All fields are optional for Google signup
    setIsLoading(true)
    setError('')

    // Store signup data in localStorage to preserve it through OAuth redirect
    localStorage.setItem('curare_signup_data', JSON.stringify({
      accessCode: accessCode,
      uli: uli,
      group: group,
      birthday: birthday || '',
      parentEmail: parentEmail || '',
      parentConsent
    }))

    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) throw signInError
    } catch (err) {
      console.error('Error:', err)
      localStorage.removeItem('curare_signup_data')
      if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
        setError('Google sign-in is not enabled. Please use email/password signup or contact support.')
      } else {
        setError(err.message || 'An error occurred during signup. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signInError) throw signInError
    } catch (err) {
      console.error('Error:', err)
      if (err.message?.includes('provider is not enabled') || err.message?.includes('Unsupported provider')) {
        setError('Google sign-in is not enabled. Please use email/password login or contact support.')
      } else {
        setError(err.message || 'An error occurred during login. Please try again.')
      }
      setIsLoading(false)
    }
  }

  if (!accessCode || !uli || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Invalid Access</h1>
          <p className="text-gray-600 mb-4">Please enter a valid access code and ULI first.</p>
          <Link to="/" className="text-curare-blue hover:underline">Go to Homepage</Link>
        </div>
      </div>
    )
  }

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">Check Your Inbox!</h2>
            <p className="text-gray-600 mb-2">
              We've sent a verification email to {signupNameOrEmail.includes('@') ? signupNameOrEmail : `${signupNameOrEmail.replace(/\s+/g, '').toLowerCase()}@curare.local`}.
            </p>
            <p className="text-gray-600 mb-2">
              <strong>This is your login email.</strong> Use this email and your password to log in.
            </p>
            {isUnder18() && parentEmail && (
              <p className="text-gray-600 mb-2 text-sm">
                Note: Your parent/guardian email ({parentEmail}) has been recorded for consent verification purposes only. It is not used for login.
              </p>
            )}
            <p className="text-gray-600">
              Please click the link in the email to verify your account and complete signup.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="px-4 py-12 pt-24">
        <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <SplitText
            text="Welcome to Curare"
            className="text-4xl font-semibold text-black mb-4"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('signup')
                setError('')
              }}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'text-curare-blue border-b-2 border-curare-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setActiveTab('login')
                setError('')
              }}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-curare-blue border-b-2 border-curare-blue'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'signup' ? (
              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name or Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupNameOrEmail}
                    onChange={(e) => setSignupNameOrEmail(e.target.value)}
                    placeholder="John Doe or john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birthday <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    required
                  />
                </div>

                {isUnder18() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent/Guardian Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                      required={isUnder18()}
                    />
                  </div>
                )}

                {isUnder18() && (
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="parentConsent"
                      checked={parentConsent}
                      onChange={(e) => setParentConsent(e.target.checked)}
                      className="mt-1 mr-3"
                      required={isUnder18()}
                    />
                    <label htmlFor="parentConsent" className="text-sm text-gray-700">
                      I as a parent/legal guardian consent to my child's use of Curare and agree to the Terms of Service and Privacy Policy.
                    </label>
                  </div>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="tosConsent"
                    checked={tosConsent}
                    onChange={(e) => setTosConsent(e.target.checked)}
                    className="mt-1 mr-3"
                    required
                  />
                  <label htmlFor="tosConsent" className="text-sm text-gray-700">
                    I agree to the <Link to="/terms-of-service" target="_blank" className="text-curare-blue hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" target="_blank" className="text-curare-blue hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <p className="text-xs text-gray-500 italic">
                  Note: Fields marked with * are required for email/password signup. Google signup bypasses these requirements.
                </p>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-curare-blue text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing up...' : 'Sign Up'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login')
                      setError('')
                    }}
                    className="text-curare-blue hover:underline font-medium"
                  >
                    Log In
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name or Email
                  </label>
                  <input
                    type="text"
                    value={loginNameOrEmail}
                    onChange={(e) => setLoginNameOrEmail(e.target.value)}
                    placeholder="John Doe or john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-curare-blue text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Log in with Google
                </button>
              </form>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
