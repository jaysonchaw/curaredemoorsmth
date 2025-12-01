import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LessonsTab from '../../components/teacher/LessonsTab'
import AssignmentsTab from '../../components/teacher/AssignmentsTab'
import PostsTab from '../../components/teacher/PostsTab'

const ClassroomDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [classroom, setClassroom] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClassroom()
  }, [id])

  const fetchClassroom = async () => {
    try {
      // Check for test mode
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Load from localStorage (shared across tabs)
        const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
        const foundClassroom = testClassrooms.find(c => c.id === id)
        if (foundClassroom) {
          setClassroom(foundClassroom)
        }
        setLoading(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/classrooms/${id}`, {
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClassroom(data)
      }
    } catch (error) {
      console.error('Error fetching classroom:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'posts', label: 'Posts' },
    { id: 'lessons', label: 'Lessons' },
    { id: 'settings', label: 'Settings' },
  ]

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

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Classroom not found</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="mt-4 px-4 py-2 bg-curare-blue text-white rounded-lg"
          >
            Back to Dashboard
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/teacher/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{classroom.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                <span className="text-sm text-gray-600">Code: </span>
                <code className="text-sm font-mono font-bold text-curare-blue">{classroom.code}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(classroom.code)
                    alert('Classroom code copied to clipboard!')
                  }}
                  className="ml-2 px-2 py-1 text-xs bg-curare-blue text-white rounded hover:bg-blue-700 transition-colors"
                  title="Copy code"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-curare-blue text-curare-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="mt-1 text-gray-900">{classroom.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade</p>
                <p className="mt-1 text-gray-900">{classroom.grade || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age Range</p>
                <p className="mt-1 text-gray-900">{classroom.age_range || 'Not specified'}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-2">
              <p className="text-sm text-gray-500">
                Share this code with students: <code className="font-mono font-bold text-curare-blue">{classroom.code}</code>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(classroom.code)
                  alert('Classroom code copied to clipboard!')
                }}
                className="px-3 py-1 text-xs bg-curare-blue text-white rounded hover:bg-blue-700 transition-colors"
                title="Copy code"
              >
                📋 Copy
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Students join at <span className="font-mono">/join-classroom</span>
            </p>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Students</h2>
              <button className="px-4 py-2 bg-curare-blue text-white rounded-lg hover:bg-blue-700">
                Add Students
              </button>
            </div>
            <p className="text-gray-600">Student management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab classroomId={id} />
        )}

        {activeTab === 'posts' && (
          <PostsTab classroomId={id} />
        )}

        {activeTab === 'lessons' && (
          <LessonsTab classroomId={id} />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                  Regenerate Code
                </button>
              </div>
              <div>
                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                  Export Roster CSV
                </button>
              </div>
              <div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Delete Classroom
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ClassroomDetail

