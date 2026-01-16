import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../services/supabaseService'
import { 
  getCookieConsent, 
  setCookieConsent, 
  initializeCookieConsent,
  getUserAge,
  isMinor,
  isEUUK,
  COOKIE_CATEGORIES,
  removeSessionToken
} from '../utils/cookieManager'

const Settings = () => {
  const navigate = useNavigate()
  const [isLightMode, setIsLightMode] = useState(false)
  const [cookieConsent, setCookieConsentState] = useState(null)
  const [isMinorUser, setIsMinorUser] = useState(false)
  const [isEUUKUser, setIsEUUKUser] = useState(false)

  useEffect(() => {
    // Load light mode preference
    const lightMode = localStorage.getItem('tsv2LightMode') === 'true'
    setIsLightMode(lightMode)
    
    // Initialize cookie consent
    const initCookies = async () => {
      const consent = await initializeCookieConsent()
      setCookieConsentState(consent)
      
      // Check if user is minor
      const minor = isMinor()
      setIsMinorUser(minor)
      
      // Check if user is in EU/UK
      const euuk = await isEUUK()
      setIsEUUKUser(euuk)
    }
    
    initCookies()
  }, [])

  const handleCookieChange = async (type, value) => {
    if (!cookieConsent) return
    
    // Minors can only have essential cookies
    if (isMinorUser && type !== COOKIE_CATEGORIES.ESSENTIAL) {
      return // Don't allow changes for minors
    }
    
    const newConsent = {
      ...cookieConsent,
      [type]: value
    }
    
    // If turning off "all", ensure analytical and marketing are off
    if (type === 'all' && !value) {
      newConsent.analytical = false
      newConsent.marketing = false
    }
    
    await setCookieConsent(newConsent)
    setCookieConsentState(newConsent)
  }

  const toggleLightMode = () => {
    const newValue = !isLightMode
    const bgColor = newValue ? '#ffffff' : '#161d25ff'
    
    document.body.style.backgroundColor = bgColor
    document.documentElement.style.backgroundColor = bgColor
    
    setIsLightMode(newValue)
    localStorage.setItem('tsv2LightMode', String(newValue))
    window.dispatchEvent(new Event('lightModeChanged'))
  }

  const handleLogout = async () => {
    try {
      await signOut()
      removeSessionToken()
      localStorage.removeItem('user')
      // Clear age and onboarding responses
      localStorage.removeItem('curare_user_age')
      sessionStorage.removeItem('welcomeResponses')
      sessionStorage.clear()
      navigate('/')
    } catch (error) {
      // Still navigate even if signOut fails
      removeSessionToken()
      localStorage.removeItem('user')
      // Clear age and onboarding responses
      localStorage.removeItem('curare_user_age')
      sessionStorage.removeItem('welcomeResponses')
      sessionStorage.clear()
      navigate('/')
    }
  }

  // Toggle switch component
  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{
      position: 'relative',
      display: 'inline-block',
      width: '44px',
      height: '24px',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <span style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'),
        borderRadius: '12px',
        transition: 'background-color 0.2s ease'
      }} />
      <span style={{
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        width: '20px',
        height: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        transition: 'left 0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
      }} />
    </label>
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isLightMode ? '#ffffff' : '#161d25',
      padding: '120px 64px 64px 64px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/testsecurev2')}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '16px',
          fontWeight: 400,
          color: isLightMode ? '#000000' : '#ffffff'
        }}>
          ← Back
        </span>
      </button>

      <h1 style={{
        fontFamily: "'Unbounded', sans-serif",
        fontSize: '32px',
        fontWeight: 700,
        color: isLightMode ? '#000000' : '#ffffff',
        marginBottom: '48px'
      }}>
        Settings
      </h1>

      {/* Cookies Section */}
      {cookieConsent && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '18px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            marginBottom: '24px'
          }}>
            Cookies
          </h2>
          
          <div style={{
            backgroundColor: isLightMode ? '#f5f5f5' : '#29323c',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: isLightMode ? '#000000' : '#ffffff'
              }}>
                Cookies All
              </span>
              <ToggleSwitch
                checked={isMinorUser ? false : (cookieConsent.analytical && cookieConsent.marketing)}
                onChange={(e) => {
                  if (isMinorUser) return // Minors cannot enable
                  const allEnabled = e.target.checked
                  handleCookieChange(COOKIE_CATEGORIES.ANALYTICAL, allEnabled)
                  handleCookieChange(COOKIE_CATEGORIES.MARKETING, allEnabled)
                }}
                disabled={isMinorUser}
              />
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: isMinorUser ? 0.6 : 1
            }}>
              <span style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: isLightMode ? '#000000' : '#ffffff'
              }}>
                Cookies Essential
              </span>
              <ToggleSwitch
                checked={cookieConsent.essential !== false} // Default to true, but allow toggle
                onChange={(e) => {
                  // Essential cookies should always be on, but allow visual toggle
                  // Actually set it to true if user tries to turn it off
                  if (!e.target.checked) {
                    // User tried to turn off - force it back on
                    const newConsent = { ...cookieConsent, essential: true }
                    setCookieConsent(newConsent)
                    setCookieConsentState(newConsent)
                  }
                }}
              />
            </div>
            
            {isMinorUser && (
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                color: isLightMode ? '#666666' : '#999999',
                margin: '8px 0 0 0',
                fontStyle: 'italic'
              }}>
                As a minor, only essential cookies are available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: isLightMode ? '#e3e3e3' : '#3b4652',
        marginBottom: '48px'
      }} />

      {/* General Section */}
      <div>
        <h2 style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          color: isLightMode ? '#000000' : '#ffffff',
          marginBottom: '24px'
        }}>
          General
        </h2>
        
        <div style={{
          backgroundColor: isLightMode ? '#f5f5f5' : '#29323c',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <span style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: isLightMode ? '#000000' : '#ffffff'
          }}>
            {isLightMode ? 'Light mode' : 'Dark mode'}
          </span>
          <ToggleSwitch
            checked={isLightMode}
            onChange={toggleLightMode}
          />
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <span style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: '#f73d35',
            textDecoration: 'underline'
          }}>
            Log out
          </span>
        </button>
      </div>
    </div>
  )
}

export default Settings
