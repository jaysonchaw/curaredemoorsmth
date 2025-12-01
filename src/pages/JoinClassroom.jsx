import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const JoinClassroom = () => {
  const navigate = useNavigate()
  const [classroomCode, setClassroomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode
        const testUserData = JSON.parse(sessionStorage.getItem('test_user_data'))
        if (!testUserData) {
          setError('Please log in first')
          setLoading(false)
          return
        }

        // Get classroom code (normalize to uppercase, no spaces)
        const normalizedCode = classroomCode.toUpperCase().trim().replace(/\s+/g, '')
        
        // Get all test classrooms from localStorage (shared across tabs, cleared on teacher logout)
        const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
        
        // Find classroom by code (case-insensitive comparison, robust matching)
        const classroom = testClassrooms.find(c => {
          if (!c || !c.code) return false
          const classroomCodeUpper = String(c.code).toUpperCase().trim().replace(/\s+/g, '')
          return classroomCodeUpper === normalizedCode
        })
        
        if (!classroom) {
          setError('Invalid classroom code.')
          setLoading(false)
          return
        }

        const memberships = JSON.parse(sessionStorage.getItem('test_classroom_memberships') || '[]')
        const existing = memberships.find(m => m.classroom_id === classroom.id && m.student_id === testUserData.id)
        
        if (existing) {
          setError('You are already in this classroom')
          setLoading(false)
          return
        }

        memberships.push({
          id: `membership-${Date.now()}`,
          classroom_id: classroom.id,
          student_id: testUserData.id,
          status: 'active',
          joined_at: new Date().toISOString(),
        })
        sessionStorage.setItem('test_classroom_memberships', JSON.stringify(memberships))
        setSuccess(true)
        setTimeout(() => {
          navigate(`/dashboard/classroom/${classroom.id}`)
        }, 1500)
        return
      }

      // Production mode
      const userData = JSON.parse(localStorage.getItem('user_data'))
      if (!userData) {
        setError('Please log in first')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:3001/api/students/classrooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: classroomCode.toUpperCase().trim(),
          studentId: userData.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Get classroom ID from response or use the classroom we just joined
        const classroomId = data.classroomId || data.classroom?.id
        setTimeout(() => {
          if (classroomId) {
            navigate(`/dashboard/classroom/${classroomId}`)
          } else {
            navigate('/dashboard')
          }
        }, 1500)
      } else {
        setError(data.error || 'Failed to join classroom')
      }
    } catch (error) {
      console.error('Error joining classroom:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join a Classroom
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 7-character classroom code provided by your teacher
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Successfully joined classroom! Redirecting...
            </div>
          )}

          <div>
            <label htmlFor="classroomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Classroom Code
            </label>
            <input
              id="classroomCode"
              name="classroomCode"
              type="text"
              required
              maxLength={7}
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue uppercase font-mono text-center text-2xl tracking-widest"
              placeholder="ABC1234"
              disabled={loading || success}
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              7 characters (letters and numbers)
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success || classroomCode.length !== 7}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-curare-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-curare-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : success ? 'Joined!' : 'Join Classroom'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-sm text-curare-blue hover:text-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinClassroom

