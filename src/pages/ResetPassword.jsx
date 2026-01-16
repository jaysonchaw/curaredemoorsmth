import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPasswordWithToken, signOut } from '../services/supabaseService'
import { getInitialLightMode } from '../utils/lightModeInit'
import { removeSessionToken } from '../utils/cookieManager'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  
  const [isLightMode] = useState(getInitialLightMode)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)
  const [resetButtonHover, setResetButtonHover] = useState(false)
  const [resetButtonPressed, setResetButtonPressed] = useState(false)

  useEffect(() => {
    if (!token || !email) {
      navigate('/auth')
    }
  }, [token, email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordError('')
    setConfirmPasswordError('')
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setPasswordError('This password is too short. Please use at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      // Call Edge Function to reset password
      const { data: resetData, error: resetError } = await resetPasswordWithToken(token, email, password)

      if (resetError) {
        setError(resetError)
        return
      }

      if (resetData?.success) {
        // Password changed - log out user on all devices
        // Sign out current session
        await signOut()
        removeSessionToken()
        localStorage.removeItem('user')
        // Clear all user-specific localStorage data
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('user_') || key.startsWith('tsv2'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        sessionStorage.clear()
        
        // Success - redirect to login
        navigate('/auth?reset=success')
      } else {
        setError(resetData?.error || 'Password reset failed')
      }
      
    } catch (err) {
      setError(err.message || 'Password reset failed')
    } finally {
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
            Reset Password
          </h1>

          {error && (
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                width: '100%',
                height: '56px',
                backgroundColor: isLightMode ? '#ffaaa7ff' : '#6a0d09ff',
                border: `2pt solid #f73d35`,
                borderRadius: '8px'
              }}>
              </div>
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
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError('')
                }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                placeholder="New Password"
                required
                style={{
                  width: '100%',
                  height: '56px',
                  padding: '0 16px',
                  borderRadius: '8px',
                  border: `2pt solid ${passwordError ? '#f73d35' : (focusedInput === 'password' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                  backgroundColor: passwordError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                  color: isLightMode ? '#111827' : '#f9fafb',
                  fontSize: '16px',
                  fontFamily: "'Inter Tight', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              {passwordError && (
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
                    {passwordError}
                  </span>
                </div>
              )}
            </div>

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
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setConfirmPasswordError('')
                  }}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="Confirm Password"
                  required
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    border: `2pt solid ${confirmPasswordError ? '#f73d35' : (focusedInput === 'confirmPassword' ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                    backgroundColor: confirmPasswordError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                    color: isLightMode ? '#111827' : '#f9fafb',
                    fontSize: '16px',
                    fontFamily: "'Inter Tight', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
                {confirmPasswordError && (
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
                      {confirmPasswordError}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => !isLoading && setResetButtonHover(true)}
                onMouseLeave={() => {
                  setResetButtonHover(false)
                  setResetButtonPressed(false)
                }}
                onMouseDown={() => !isLoading && setResetButtonPressed(true)}
                onMouseUp={() => setResetButtonPressed(false)}
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
                    resetButtonPressed
                      ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                      : resetButtonHover
                      ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                      : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                  }
                  alt="Reset Password"
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
          </form>

          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLightMode ? '#6b7280' : '#9ca3af',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              alignSelf: 'center'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  )
}

export default ResetPassword

