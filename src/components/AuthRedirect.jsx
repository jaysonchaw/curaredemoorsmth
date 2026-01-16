import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../services/supabaseService'

const AuthRedirect = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { session, error } = await getSession()
        if (error || !session) {
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return null // Still checking
  }

  if (isAuthenticated) {
    return <Navigate to="/testsecurev2" replace />
  }

  return <Navigate to="/auth" replace />
}

export default AuthRedirect

