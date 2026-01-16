import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { verifyResetCode } from '../services/supabaseService'
import { getInitialLightMode } from '../utils/lightModeInit'

const VerifyCode = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [isLightMode] = useState(getInitialLightMode)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/auth')
    }
  }, [email, navigate])

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  // Keep one input focused at all times
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If clicking outside inputs, focus the current active one
      if (!inputRefs.current.some(ref => ref && ref.contains(e.target))) {
        const nextIndex = code.findIndex(digit => digit === '') !== -1 
          ? code.findIndex(digit => digit === '') 
          : code.length - 1
        if (inputRefs.current[nextIndex]) {
          inputRefs.current[nextIndex].focus()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [code])

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    const fullCode = code.join('')
    if (fullCode.length === 6 && !isLoading && !error) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const handleVerify = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) return

    setError('')
    setIsLoading(true)

    try {
      const { data, error: verifyError } = await verifyResetCode(email, fullCode)
      
      if (verifyError) {
        setError(verifyError)
        setIsLoading(false)
        // Error styling will be applied via hasError state
        return
      }

      if (data?.success && data?.token) {
        // Auto-advance to reset password page
        navigate(`/reset-password?token=${data.token}&email=${encodeURIComponent(email)}`)
      } else {
        setError('Verification failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(0, 1)
    
    if (digit) {
      const newCode = [...code]
      newCode[index] = digit
      setCode(newCode)
      setError('') // Clear error on new input

      // Move to next box if not the last one
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus()
        setFocusedIndex(index + 1)
      }
    } else {
      // Clear current box
      const newCode = [...code]
      newCode[index] = ''
      setCode(newCode)
      setError('')
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous box and clear it
      const newCode = [...code]
      newCode[index - 1] = ''
      setCode(newCode)
      inputRefs.current[index - 1].focus()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus()
      setFocusedIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus()
      setFocusedIndex(index + 1)
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || ''
    }
    
    setCode(newCode)
    setError('')
    
    // Focus the last filled box or the first empty one
    const nextIndex = pasted.length < 6 ? pasted.length : 5
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus()
      setFocusedIndex(nextIndex)
    }
  }

  const hasError = error && !isLoading

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
          <h1 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            textAlign: 'center',
            margin: 0
          }}>
            Enter Verification Code
          </h1>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            color: isLightMode ? '#d0d1d2' : '#3b4652',
            textAlign: 'center',
            margin: 0
          }}>
            We've sent a 6-digit code to {email}
          </p>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%'
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

          <div style={{
            width: '100%',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setFocusedIndex(index)}
                maxLength={1}
                style={{
                  width: '56px',
                  height: '56px',
                  padding: 0,
                  borderRadius: '8px',
                  border: `2pt solid ${hasError ? '#f73d35' : (focusedIndex === index ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'))}`,
                  backgroundColor: hasError ? (isLightMode ? '#ffaaa7ff' : '#6a0d09ff') : (isLightMode ? '#ffffff' : '#161d25ff'),
                  color: isLightMode ? '#111827' : '#f9fafb',
                  fontSize: '24px',
                  fontFamily: "'Inter Tight', sans-serif",
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
            ))}
          </div>

          {isLoading && (
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '14px',
              color: isLightMode ? '#d0d1d2' : '#3b4652',
              textAlign: 'center',
              margin: 0
            }}>
              Verifying...
            </p>
          )}

          <button
            onClick={() => navigate('/auth')}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLightMode ? '#d0d1d2' : '#3b4652',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '8px'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  )
}

export default VerifyCode
