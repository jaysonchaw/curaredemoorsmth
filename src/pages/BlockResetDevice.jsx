import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../services/supabaseService'
import { getInitialLightMode } from '../utils/lightModeInit'

const BlockResetDevice = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const deviceId = searchParams.get('deviceId')
  
  const [isLightMode] = useState(getInitialLightMode)
  const [status, setStatus] = useState('blocking') // 'blocking', 'success', 'error'
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email || !deviceId) {
      setStatus('error')
      setError('Invalid link')
      return
    }

    handleBlockDevice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, deviceId])

  const handleBlockDevice = async () => {
    try {
      // Block this device from sending reset emails to this account
      const { error: blockError } = await supabase.functions.invoke('block-reset-device', {
        body: { email: email.toLowerCase(), deviceId }
      })

      if (blockError) {
        setStatus('error')
        setError('Failed to block device. Please try again or contact support.')
        return
      }

      setStatus('success')
    } catch (err) {
      console.error('Error blocking device:', err)
      setStatus('error')
      setError('An error occurred. Please try again or contact support.')
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
          {status === 'blocking' && (
            <>
              <h1 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                textAlign: 'center',
                margin: 0
              }}>
                Blocking Device...
              </h1>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                textAlign: 'center',
                margin: 0
              }}>
                Please wait...
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
                Device Blocked
              </h1>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                color: isLightMode ? '#d0d1d2' : '#3b4652',
                textAlign: 'center',
                margin: 0,
                maxWidth: '400px'
              }}>
                This device has been blocked from sending password reset emails to this account. If this was a mistake, please contact support.
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
                Error
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
                  {error || 'An error occurred'}
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
        </div>
      </div>
    </>
  )
}

export default BlockResetDevice
