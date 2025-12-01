import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateClassroomModal from '../../components/teacher/CreateClassroomModal'

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [classrooms, setClassrooms] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState({
    activeClasses: 0,
    pendingConsent: 0,
    avgSessionTime: 0,
    pilotInvitesRemaining: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for test mode first
    const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
    
    if (isTestMode) {
      const testTeacher = JSON.parse(sessionStorage.getItem('teacher_token') || '{}')
      const testTeacherData = JSON.parse(sessionStorage.getItem('teacher_data') || '{}')
      setTeacher(testTeacher)
      
      // Load test classrooms from localStorage (shared across tabs)
      const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
      setClassrooms(testClassrooms)
      setStats({
        activeClasses: testClassrooms.length,
        pendingConsent: 0,
        avgSessionTime: 0,
        pilotInvitesRemaining: 100,
      })
      setLoading(false)
      return
    }

    // Get teacher from localStorage (implement proper auth in production)
    const teacherData = localStorage.getItem('teacher_token')
    if (!teacherData) {
      navigate('/teacher/login')
      return
    }

    const teacherObj = JSON.parse(teacherData)
    setTeacher(teacherObj)
    fetchDashboardData(teacherObj.id)
  }, [navigate])

  const fetchDashboardData = async (teacherId) => {
    try {
      // Check for test mode
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Load from localStorage (shared across tabs)
        const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
        setClassrooms(testClassrooms)
        setStats({
          activeClasses: testClassrooms.length,
          pendingConsent: 0,
          avgSessionTime: 0,
          pilotInvitesRemaining: 100,
        })
        setLoading(false)
        return
      }

      // Fetch classrooms
      const response = await fetch(`http://localhost:3001/api/classrooms?teacherId=${teacherId}`, {
        headers: {
          'x-teacher-id': teacherId,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClassrooms(data)
        setStats({
          activeClasses: data.length,
          pendingConsent: 0, // TODO: Calculate from students
          avgSessionTime: 0, // TODO: Calculate from analytics
          pilotInvitesRemaining: 100, // TODO: Get from teacher settings
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClassroom = () => {
    setShowCreateModal(true)
  }

  const handleClassroomCreated = (newClassroom) => {
    setClassrooms([newClassroom, ...classrooms])
    setStats({ ...stats, activeClasses: stats.activeClasses + 1 })
    
    // Refresh data to ensure consistency
    const teacherData = JSON.parse(localStorage.getItem('teacher_token') || sessionStorage.getItem('teacher_token') || '{}')
    if (teacherData.id) {
      fetchDashboardData(teacherData.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {sessionStorage.getItem('is_teacher_test_mode') === 'true' && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  TEST MODE
                </span>
              )}
              <span className="text-sm text-gray-700">{teacher?.name || 'Teacher'}</span>
              <button
                onClick={() => {
                  const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
                  if (isTestMode) {
                    // Clear all teacher test mode data
                    sessionStorage.removeItem('teacher_token')
                    sessionStorage.removeItem('teacher_data')
                    sessionStorage.removeItem('is_teacher_test_mode')
                    // Clear test classroom data when teacher logs out (classroom codes become invalid)
                    localStorage.removeItem('test_classrooms')
                    localStorage.removeItem('test_posts')
                    localStorage.removeItem('test_assignments')
                    localStorage.removeItem('test_classroom_lessons')
                  } else {
                    localStorage.removeItem('teacher_token')
                  }
                  navigate('/teacher/login')
                }}
                className="text-sm text-gray-700 hover:text-curare-blue"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Active Classes</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeClasses}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Pending Consent</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pendingConsent}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Avg Session</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.avgSessionTime} min</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600">Pilot Invites</h3>
            <p className="mt-2 text-3xl font-bold text-curare-blue">{stats.pilotInvitesRemaining}</p>
          </div>
        </div>

        {/* Classrooms Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">My Classrooms</h2>
            <button
              onClick={handleCreateClassroom}
              className="px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Classroom
            </button>
          </div>
          <div className="p-6">
            {classrooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No classrooms yet</p>
                <button
                  onClick={handleCreateClassroom}
                  className="px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Create Your First Classroom
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.id}
                    onClick={() => navigate(`/teacher/classrooms/${classroom.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-curare-blue hover:shadow-md transition-all cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{classroom.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{classroom.description || 'No description'}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Code: {classroom.code}</span>
                      <span className="text-xs text-gray-500">{classroom.grade || 'All grades'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateClassroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleClassroomCreated}
      />
    </div>
  )
}

export default TeacherDashboard

