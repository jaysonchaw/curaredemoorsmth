import { useState, useEffect } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const StudentClassroom = () => {
  const { classroomId } = useParams()
  const navigate = useNavigate()
  const { userData } = useOutletContext()
  const [classroom, setClassroom] = useState(null)
  const [activeTab, setActiveTab] = useState('assignments')
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [posts, setPosts] = useState([])
  const [lessons, setLessons] = useState([])

  useEffect(() => {
    fetchClassroom()
  }, [classroomId])

  useEffect(() => {
    if (classroom) {
      if (activeTab === 'assignments') fetchAssignments()
      if (activeTab === 'posts') fetchPosts()
      if (activeTab === 'lessons') fetchLessons()
    }
  }, [classroom, activeTab])

  const fetchClassroom = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
        const foundClassroom = testClassrooms.find(c => c.id === classroomId)
        if (foundClassroom) {
          setClassroom(foundClassroom)
          setLoading(false)
          return
        }
      }

      // Production mode - fetch from API
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/signup')
        return
      }

      const response = await fetch(`http://localhost:3001/api/students/classrooms/${classroomId}`, {
        headers: {
          'x-student-id': session.user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClassroom(data)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching classroom:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Check localStorage first (shared across tabs), fallback to sessionStorage
        const testAssignments = JSON.parse(localStorage.getItem('test_assignments') || sessionStorage.getItem('test_assignments') || '[]')
        setAssignments(testAssignments.filter(a => a.status === 'published'))
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:3001/api/students/classrooms/${classroomId}/assignments`, {
        headers: {
          'x-student-id': session.user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Check localStorage first (shared across tabs), fallback to sessionStorage
        const testPosts = JSON.parse(localStorage.getItem('test_posts') || sessionStorage.getItem('test_posts') || '[]')
        setPosts(testPosts)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:3001/api/students/classrooms/${classroomId}/posts`, {
        headers: {
          'x-student-id': session.user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const fetchLessons = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Check localStorage first (shared across tabs), fallback to sessionStorage
        const testLessons = JSON.parse(localStorage.getItem('test_classroom_lessons') || sessionStorage.getItem('test_classroom_lessons') || '[]')
        const mappedLessons = testLessons.filter(l => l.is_mapped && !l.locked)
        setLessons(mappedLessons.sort((a, b) => (a.seq_order || 999) - (b.seq_order || 999)))
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(`http://localhost:3001/api/students/classrooms/${classroomId}/lessons`, {
        headers: {
          'x-student-id': session.user.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classroom...</p>
        </div>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Classroom not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-curare-blue text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'lessons', label: 'Lessons', icon: '📚' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 mb-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{classroom.name}</h1>
              {classroom.description && (
                <p className="mt-1 text-gray-600">{classroom.description}</p>
              )}
            </div>
            <div className="text-right">
              {classroom.grade && (
                <p className="text-sm text-gray-500">{classroom.grade}</p>
              )}
              {classroom.age_range && (
                <p className="text-sm text-gray-500">Ages {classroom.age_range}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-curare-blue text-curare-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
            </div>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">No assignments yet</p>
                <p className="text-gray-500 text-sm mt-2">Your teacher will post assignments here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-all ${
                      isOverdue(assignment.due_date) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                          {assignment.mandatory && (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                              Required
                            </span>
                          )}
                          {isOverdue(assignment.due_date) && (
                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                              Overdue
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p className="text-gray-600 mb-3">{assignment.description}</p>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {assignment.due_date && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Due {formatDate(assignment.due_date)}
                            </div>
                          )}
                          {assignment.total_points && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              {assignment.total_points} points
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/assignment/${assignment.id}`)}
                        className="ml-4 px-6 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
            </div>
            {posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-600 text-lg">No announcements yet</p>
                <p className="text-gray-500 text-sm mt-2">Your teacher will post updates here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts
                  .sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1
                    if (!a.pinned && b.pinned) return 1
                    return new Date(b.created_at) - new Date(a.created_at)
                  })
                  .map((post) => (
                    <div
                      key={post.id}
                      className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                        post.pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {post.pinned && (
                            <span className="text-yellow-600" title="Pinned">
                              📌
                            </span>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">
                                {post.teacher?.full_name || post.teacher?.name || 'Teacher'}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">
                            {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lessons</h2>
            </div>
            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 text-lg">No lessons assigned yet</p>
                <p className="text-gray-500 text-sm mt-2">Your teacher will assign lessons here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/lesson/${lesson.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.path_type || 'Pre-Med'}</p>
                      </div>
                      {lesson.mandatory && (
                        <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center text-sm text-curare-blue font-medium">
                      Start Lesson
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default StudentClassroom

