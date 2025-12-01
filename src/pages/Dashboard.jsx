import { useState, useEffect } from 'react'
import { useNavigate, Outlet, NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      // Check for test mode first
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        const testUser = JSON.parse(sessionStorage.getItem('test_user') || '{}')
        const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
        
        // Check if intro is completed for test users
        if (!testUserData.has_completed_intro) {
          navigate('/introduction')
          return
        }
        
        setUser(testUser)
        setUserData(testUserData)
        setLoading(false)
        return
      }
      
      // Normal authentication flow
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/signup')
        return
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setUser(session.user)
      setUserData(data)
      setLoading(false)
    }

    fetchUser()
  }, [navigate])

  const handleLogout = async () => {
    // Check if in test mode
    const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
    
    if (isTestMode) {
      // Clear test mode data
      sessionStorage.removeItem('test_user')
      sessionStorage.removeItem('test_user_data')
      sessionStorage.removeItem('is_test_mode')
      navigate('/')
      return
    }
    
    // Normal logout
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-curare-blue bg-blue-50'
                      : 'text-gray-700 hover:text-curare-blue hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/dashboard/roadmap"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-curare-blue bg-blue-50'
                      : 'text-gray-700 hover:text-curare-blue hover:bg-gray-50'
                  }`
                }
              >
                Roadmap
              </NavLink>
              <NavLink
                to="/dashboard/results"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-curare-blue bg-blue-50'
                      : 'text-gray-700 hover:text-curare-blue hover:bg-gray-50'
                  }`
                }
              >
                Results
              </NavLink>
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'text-curare-blue bg-blue-50'
                      : 'text-gray-700 hover:text-curare-blue hover:bg-gray-50'
                  }`
                }
              >
                Profile
              </NavLink>
              {sessionStorage.getItem('is_test_mode') === 'true' && (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'text-yellow-600 bg-yellow-50'
                        : 'text-yellow-700 hover:text-yellow-600 hover:bg-yellow-50'
                    }`
                  }
                >
                  🔧 Admin
                </NavLink>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {sessionStorage.getItem('is_test_mode') === 'true' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  TEST MODE
                </span>
              )}
              <span className="text-sm text-gray-700">
                {userData?.full_name || 'Student'}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-curare-blue"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ user, userData, setUserData }} />
      </main>
    </div>
  )
}

export default Dashboard
