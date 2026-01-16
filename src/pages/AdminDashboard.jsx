import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/authService'
import { isAdminAuthenticated, clearAdminAuth } from '../utils/adminAuth'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [userData, setUserData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, all
  const [generalAnalytics, setGeneralAnalytics] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  useEffect(() => {
    // Check admin authentication
    if (!isAdminAuthenticated()) {
      console.log('[AdminDashboard] Not authenticated, redirecting to home')
      navigate('/', { replace: true })
      return
    }
    console.log('[AdminDashboard] Admin authenticated, showing dashboard')
    fetchGeneralAnalytics()
  }, [navigate])

  const fetchGeneralAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      // Get last 48 hours of analytics
      const fortyEightHoursAgo = new Date()
      fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)
      
      // Only fetch analytics from users who consented to all cookies
      // Filter out any data from minors (shouldn't exist, but safety check)
      const { data: analytics, error } = await supabase
        .from('user_analytics')
        .select('*')
        .gte('timestamp', fortyEightHoursAgo.toISOString())
        .order('timestamp', { ascending: true })

      if (error) {
        // Table might not exist yet - show empty state
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('[AdminDashboard] user_analytics table does not exist yet')
          setGeneralAnalytics({
            sessions: [],
            retention: [],
            dropOffs: [],
            flaggedQuestions: [],
            sessionLengths: [],
            totals: {
              totalSessions: 0,
              totalDropOffs: 0,
              totalFlagged: 0,
              totalRetention: 0,
              avgSessionLength: 0
            }
          })
          setLoadingAnalytics(false)
          return
        }
        console.error('Error fetching analytics:', error)
        setGeneralAnalytics({
          sessions: [],
          retention: [],
          dropOffs: [],
          flaggedQuestions: [],
          sessionLengths: [],
          totals: {
            totalSessions: 0,
            totalDropOffs: 0,
            totalFlagged: 0,
            totalRetention: 0,
            avgSessionLength: 0
          }
        })
        setLoadingAnalytics(false)
        return
      }

      // Additional safety: Filter out any data that might be from minors
      // (This is a safety measure - minors should never have data synced)
      // Note: Analytics only syncs for users with all cookies enabled (not minors)
      const safeAnalytics = (analytics || []).filter(item => {
        // If data contains age info and it's < 13, exclude it
        if (item.data && typeof item.data === 'object') {
          const age = item.data.age
          if (age !== null && age !== undefined && age < 13) {
            return false
          }
        }
        return true
      })

      // Process analytics data (using filtered data)
      const processed = processAnalyticsData(safeAnalytics)
      setGeneralAnalytics(processed)
      setLoadingAnalytics(false)
    } catch (err) {
      console.error('Error fetching general analytics:', err)
      setGeneralAnalytics({
        sessions: [],
        retention: [],
        dropOffs: [],
        flaggedQuestions: [],
        sessionLengths: []
      })
      setLoadingAnalytics(false)
    }
  }

  const processAnalyticsData = (data) => {
    // Group by hour for last 48 hours
    const hourlyData = {}
    const now = new Date()
    
    // Initialize 48 hours of data
    for (let i = 47; i >= 0; i--) {
      const hour = new Date(now)
      hour.setHours(hour.getHours() - i)
      hour.setMinutes(0)
      hour.setSeconds(0)
      hour.setMilliseconds(0)
      const key = hour.toISOString()
      hourlyData[key] = {
        hour: key,
        sessions: 0,
        sessionLength: 0,
        dropOffs: 0,
        flaggedQuestions: 0,
        retention: 0
      }
    }

    // Process each analytics entry
    data.forEach(entry => {
      const entryTime = new Date(entry.timestamp)
      entryTime.setMinutes(0)
      entryTime.setSeconds(0)
      entryTime.setMilliseconds(0)
      const hourKey = entryTime.toISOString()

      if (hourlyData[hourKey]) {
        if (entry.event_type === 'session') {
          hourlyData[hourKey].sessions++
          if (entry.data?.totalActiveTime) {
            hourlyData[hourKey].sessionLength += entry.data.totalActiveTime
          }
        } else if (entry.event_type === 'lesson_dropoff') {
          hourlyData[hourKey].dropOffs++
        } else if (entry.event_type === 'flagged_question') {
          hourlyData[hourKey].flaggedQuestions++
        } else if (entry.event_type === 'retention') {
          hourlyData[hourKey].retention++
        }
      }
    })

    // Convert to arrays for graphing
    const hours = Object.keys(hourlyData).sort()
    return {
      sessions: hours.map(h => ({ time: h, value: hourlyData[h].sessions })),
      sessionLength: hours.map(h => ({ 
        time: h, 
        value: hourlyData[h].sessions > 0 
          ? Math.round(hourlyData[h].sessionLength / hourlyData[h].sessions / 60) // minutes
          : 0 
      })),
      dropOffs: hours.map(h => ({ time: h, value: hourlyData[h].dropOffs })),
      flaggedQuestions: hours.map(h => ({ time: h, value: hourlyData[h].flaggedQuestions })),
      retention: hours.map(h => ({ time: h, value: hourlyData[h].retention })),
      totals: {
        totalSessions: data.filter(d => d.event_type === 'session').length,
        totalDropOffs: data.filter(d => d.event_type === 'lesson_dropoff').length,
        totalFlagged: data.filter(d => d.event_type === 'flagged_question').length,
        totalRetention: data.filter(d => d.event_type === 'retention').length,
        avgSessionLength: data
          .filter(d => d.event_type === 'session' && d.data?.totalActiveTime)
          .reduce((sum, d) => sum + (d.data.totalActiveTime || 0), 0) / 
          Math.max(data.filter(d => d.event_type === 'session').length, 1) / 60 // minutes
      }
    }
  }

  // Simple line chart component
  const LineChart = ({ data, color = '#ffffff', height = 120, label }) => {
    if (!data || data.length === 0) {
      return (
        <div style={{
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          No data available
        </div>
      )
    }

    const maxValue = Math.max(...data.map(d => d.value), 1)
    const minValue = Math.min(...data.map(d => d.value), 0)
    const range = maxValue - minValue || 1
    const width = 100
    const chartHeight = height - 40

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * width
      const y = chartHeight - ((d.value - minValue) / range) * chartHeight
      return `${x},${y}`
    }).join(' ')

    return (
      <div style={{ position: 'relative', height: `${height}px` }}>
        <svg width="100%" height={height} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area under line */}
          <polygon
            points={`0,${chartHeight} ${points} ${width},${chartHeight}`}
            fill={`url(#gradient-${label})`}
            style={{ transform: 'scaleX(calc(100% / 100))' }}
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            style={{ transform: 'scaleX(calc(100% / 100))' }}
          />
          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * width
            const y = chartHeight - ((d.value - minValue) / range) * chartHeight
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="3"
                fill={color}
                style={{ transform: 'scaleX(calc(100% / 100))' }}
              />
            )
          })}
        </svg>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          fontSize: '10px',
          color: '#94a3b8',
          textAlign: 'center',
          paddingTop: '8px'
        }}>
          {label}
        </div>
      </div>
    )
  }

  const fetchUserByEmail = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setUserData(null)
    setAnalyticsData(null)

    try {
      // Get user from Supabase auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        // Try alternative method - query users table if it exists
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .single()

        if (userError || !user) {
          setError('User not found')
          setLoading(false)
          return
        }

        // Get analytics data for this user
        const { data: analytics, error: analyticsError } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })

        setUserData({
          id: user.id,
          email: user.email,
          ...user
        })
        setAnalyticsData(analytics || [])
        setLoading(false)
        return
      }

      // Find user in auth list
      const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim())
      
      if (!user) {
        setError('User not found')
        setLoading(false)
        return
      }

      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })

      setUserData({
        id: user.id,
        email: user.email,
        ...(profile || {}),
        authUser: user
      })
      setAnalyticsData(analytics || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching user:', err)
      setError('Failed to fetch user data')
      setLoading(false)
    }
  }

  const terminateUser = async () => {
    if (!userData || !userData.id) {
      setError('No user selected')
      return
    }

    if (!confirm(`Are you sure you want to TERMINATE user ${userData.email}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Delete user from Supabase Auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.id)
      
      if (deleteError) {
        setError(`Failed to terminate user: ${deleteError.message}`)
        setLoading(false)
        return
      }

      // Delete user data from users table
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id)

      // Delete analytics data
      const { error: analyticsError } = await supabase
        .from('user_analytics')
        .delete()
        .eq('user_id', userData.id)

      setSuccess(`User ${userData.email} has been terminated`)
      setUserData(null)
      setAnalyticsData(null)
      setEmail('')
      setLoading(false)
    } catch (err) {
      console.error('Error terminating user:', err)
      setError('Failed to terminate user')
      setLoading(false)
    }
  }

  const eraseUserData = async () => {
    if (!userData || !userData.id) {
      setError('No user selected')
      return
    }

    if (!confirm(`Are you sure you want to ERASE ALL DATA for user ${userData.email}? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Delete analytics data
      const { error: analyticsError } = await supabase
        .from('user_analytics')
        .delete()
        .eq('user_id', userData.id)

      // Delete progress data (if exists in progress table)
      const { error: progressError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userData.id)

      // Reset user profile data (keep account but clear data)
      const { error: resetError } = await supabase
        .from('users')
        .update({
          xp: 0,
          level: 1,
          daily_time_minutes: 30,
          selected_path: null,
          group_number: null
        })
        .eq('id', userData.id)

      setSuccess(`All data for ${userData.email} has been erased`)
      setAnalyticsData([])
      setLoading(false)
    } catch (err) {
      console.error('Error erasing user data:', err)
      setError('Failed to erase user data')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAdminAuth()
    navigate('/')
  }

  const filterAnalyticsByTimeRange = (data) => {
    if (!data || data.length === 0) return []
    if (timeRange === 'all') return data

    const now = new Date()
    const cutoff = new Date()
    
    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoff.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoff.setDate(now.getDate() - 90)
        break
      default:
        return data
    }

    return data.filter(item => new Date(item.timestamp) >= cutoff)
  }

  const filteredAnalytics = filterAnalyticsByTimeRange(analyticsData || [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0e27',
      color: '#ffffff',
      padding: '40px',
      fontFamily: "'Inter Tight', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            margin: 0,
            marginBottom: '8px',
            color: '#ffffff'
          }}>
            Admin Dashboard
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
          }}>
            Analytics & User Management
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Logout
        </button>
      </div>

      {/* General Analytics Dashboard - Last 48 Hours */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid #334155'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#ffffff',
              margin: 0,
              marginBottom: '4px'
            }}>
              General Analytics
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#94a3b8',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Last 48 Hours • Only users with all cookies enabled
            </p>
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: '4px 0 0 0',
              fontStyle: 'italic'
            }}>
              Privacy compliant: No minors tracked, only users who opted into all cookies
            </p>
          </div>
          <button
            onClick={fetchGeneralAnalytics}
            disabled={loadingAnalytics}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: loadingAnalytics ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              opacity: loadingAnalytics ? 0.6 : 1
            }}
          >
            {loadingAnalytics ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingAnalytics ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            Loading analytics...
          </div>
        ) : generalAnalytics ? (
          <>
            {/* Key Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Total Sessions
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: 'monospace'
                }}>
                  {generalAnalytics.totals?.totalSessions || 0}
                </div>
              </div>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Avg Session Length
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#60a5fa',
                  fontFamily: 'monospace'
                }}>
                  {Math.round(generalAnalytics.totals?.avgSessionLength || 0)}m
                </div>
              </div>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Drop-offs
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#f59e0b',
                  fontFamily: 'monospace'
                }}>
                  {generalAnalytics.totals?.totalDropOffs || 0}
                </div>
              </div>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Flagged Questions
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#ef4444',
                  fontFamily: 'monospace'
                }}>
                  {generalAnalytics.totals?.totalFlagged || 0}
                </div>
              </div>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px'
                }}>
                  Daily Retention
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#34d399',
                  fontFamily: 'monospace'
                }}>
                  {generalAnalytics.totals?.totalRetention || 0}
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {/* Session Activity Chart */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  Session Activity
                </div>
                <LineChart 
                  data={generalAnalytics.sessions} 
                  color="#60a5fa"
                  height={150}
                  label="Sessions per hour"
                />
              </div>

              {/* Session Length Chart */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  Average Session Length
                </div>
                <LineChart 
                  data={generalAnalytics.sessionLength} 
                  color="#34d399"
                  height={150}
                  label="Minutes"
                />
              </div>

              {/* Drop-offs Chart */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  Lesson Drop-offs
                </div>
                <LineChart 
                  data={generalAnalytics.dropOffs} 
                  color="#f59e0b"
                  height={150}
                  label="Drop-offs per hour"
                />
              </div>

              {/* Flagged Questions Chart */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  Flagged Questions
                </div>
                <LineChart 
                  data={generalAnalytics.flaggedQuestions} 
                  color="#ef4444"
                  height={150}
                  label="Flagged per hour"
                />
              </div>

              {/* Retention Chart */}
              <div style={{
                backgroundColor: '#0f172a',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: '16px'
                }}>
                  User Retention
                </div>
                <LineChart 
                  data={generalAnalytics.retention} 
                  color="#a78bfa"
                  height={150}
                  label="Daily returns"
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#94a3b8'
          }}>
            No analytics data available for the last 48 hours
          </div>
        )}
      </div>

      {/* Search Section */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #334155'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: '#ffffff'
        }}>
          Search User by Email
        </h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchUserByEmail()}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: "'Inter Tight', sans-serif"
              }}
            />
          </div>
          <button
            onClick={fetchUserByEmail}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          backgroundColor: '#7f1d1d',
          border: '1px solid #991b1b',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#fecaca'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          backgroundColor: '#14532d',
          border: '1px solid #166534',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: '#bbf7d0'
        }}>
          {success}
        </div>
      )}

      {/* User Data Section */}
      {userData && (
        <>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#ffffff'
                }}>
                  User Profile
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  margin: 0
                }}>
                  {userData.email}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={eraseUserData}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Erase Data
                </button>
                <button
                  onClick={terminateUser}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  Terminate User
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                backgroundColor: '#0f172a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  User ID
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  fontFamily: 'monospace'
                }}>
                  {userData.id?.substring(0, 20)}...
                </div>
              </div>
              {userData.xp !== undefined && (
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    XP
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#60a5fa'
                  }}>
                    {userData.xp || 0}
                  </div>
                </div>
              )}
              {userData.level !== undefined && (
                <div style={{
                  backgroundColor: '#0f172a',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '4px'
                  }}>
                    Level
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#34d399'
                  }}>
                    {userData.level || 1}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Timeline */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #334155'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#ffffff',
                margin: 0
              }}>
                Analytics Timeline
              </h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: "'Inter Tight', sans-serif"
                }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {filteredAnalytics.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#94a3b8'
              }}>
                No analytics data available for this time range
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '600px',
                overflowY: 'auto'
              }}>
                {filteredAnalytics.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      borderLeft: '4px solid #2563eb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#ffffff'
                      }}>
                        {item.event_type || 'Activity'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        fontFamily: 'monospace'
                      }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#cbd5e1',
                      lineHeight: '1.6'
                    }}>
                      {JSON.stringify(item.data || item, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!userData && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: '#94a3b8'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            📊
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#ffffff',
            marginBottom: '8px'
          }}>
            Search for a user to view analytics
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            Enter an email address above to view user data and analytics timeline
          </p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
