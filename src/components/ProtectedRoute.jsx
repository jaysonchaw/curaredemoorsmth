import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSession, isAuthenticated } from '../services/authService'
import { getSessionToken, setSessionToken } from '../utils/cookieManager'

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null) // null = checking, true/false = result
  const location = useLocation()
  
  const checkAuth = async () => {
    // Check for test mode first
    const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
    if (isTestMode) {
      const testUserData = sessionStorage.getItem('test_user_data')
      setIsAuth(!!testUserData)
      return
    }
    
    // Check skip token
    const token = getSessionToken()
    const isSkipToken = token === 'skip_token'
    const skipNavigated = sessionStorage.getItem('skip_navigated') === 'true'
    
    if (isSkipToken && !skipNavigated) {
      setIsAuth(false)
      return
    }
    
    if (isSkipToken && skipNavigated) {
      setIsAuth(true)
      return
    }
    
    // Check authentication
    if (!token) {
      setIsAuth(false)
      return
    }
    
    try {
      const { session, error } = await getSession()
      if (error || !session) {
        // If token looks valid, allow access (Supabase will refresh)
        if (token && token !== 'skip_token' && token.length > 20) {
          setIsAuth(true)
        } else {
          setIsAuth(false)
        }
      } else {
        // Session exists, ensure token is saved
        if (session.access_token) {
          setSessionToken(session.access_token)
          localStorage.setItem('user', JSON.stringify(session.user))
        }
        setIsAuth(true)
      }
    } catch (err) {
      // Network errors - if we have a token, allow access
      if (token && token !== 'skip_token' && token.length > 20) {
        setIsAuth(true)
      } else {
        setIsAuth(false)
      }
    }
  }
  
  useEffect(() => {
    checkAuth()
  }, [location.pathname])
  
  // Loading state
  if (isAuth === null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#161d25',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderTop: '4px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
  
  // Not authenticated - redirect to auth
  if (!isAuth) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default ProtectedRoute
