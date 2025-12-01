import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const TeacherLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Special test mode: if email is "testsecure", create temporary session
      if (formData.email.toLowerCase() === 'testsecure') {
        const testTeacher = {
          id: 'test-teacher-' + Date.now(),
          email: 'testsecure@test.curare',
          name: 'Test Teacher'
        }
        
        const testTeacherData = {
          id: testTeacher.id,
          email: testTeacher.email,
          name: testTeacher.name,
          is_test_mode: true
        }
        
        // Store in sessionStorage (clears on browser close)
        sessionStorage.setItem('teacher_token', JSON.stringify(testTeacher))
        sessionStorage.setItem('teacher_data', JSON.stringify(testTeacherData))
        sessionStorage.setItem('is_teacher_test_mode', 'true')
        
        // Initialize empty test classrooms in localStorage (shared across tabs)
        if (!localStorage.getItem('test_classrooms')) {
          localStorage.setItem('test_classrooms', JSON.stringify([]))
        }
        
        setLoading(false)
        navigate('/teacher/dashboard')
        return
      }

      const response = await fetch('http://localhost:3001/api/teachers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Store teacher session (implement proper JWT in production)
      localStorage.setItem('teacher_token', JSON.stringify(data.user))
      
      // Redirect to dashboard
      navigate('/teacher/dashboard')
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Teacher Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/teacher/signup" className="font-medium text-curare-blue hover:text-blue-700">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  if (e.target.value.toLowerCase() === 'testsecure') {
                    setError('')
                  }
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
              {formData.email.toLowerCase() === 'testsecure' && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ Test mode: This will create a temporary session that doesn't save to the database.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/teacher/forgot-password" className="font-medium text-curare-blue hover:text-blue-700">
                Forgot password?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-curare-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-curare-blue disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherLogin

