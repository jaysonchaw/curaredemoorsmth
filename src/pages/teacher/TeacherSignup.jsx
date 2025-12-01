import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'

const TeacherSignup = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('invite') // School key from invite link
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    teacherCode: '',
    schoolKey: inviteCode || '', // Pre-fill if invite code provided
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState(null)
  const [showSchoolKeyInput, setShowSchoolKeyInput] = useState(!inviteCode)

  // Valid teacher codes
  const validTeacherCodes = [
    'H7G9J2KM',
    'Q4P8R1ZT',
    'M2X9C6LV',
    'B8T5N0SY',
    'R3F7E4QD',
    'Z6K1W8HJ',
    'V9D2S3PL',
    'N5A0M7GX',
    'Y1C8Q6BR',
    'T4L3U9ZF',
  ]

  // Check if school key is provided and fetch school info
  useEffect(() => {
    if (inviteCode && inviteCode.startsWith('SCH-')) {
      // Verify school key and fetch school info
      fetch(`http://localhost:3001/api/schools/verify-key?key=${inviteCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.valid) {
            setSchoolInfo(data.school)
          }
        })
        .catch(err => console.error('Error verifying school key:', err))
    }
  }, [inviteCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Special testsecure mode - create temporary session (same as student signup)
    if (formData.name.toLowerCase() === 'testsecure') {
      const testTeacher = {
        id: 'test-teacher-' + Date.now(),
        email: 'developer@test.curare',
        name: 'Developer Tester',
        role: 'teacher',
      }
      
      const testTeacherData = {
        id: testTeacher.id,
        email: testTeacher.email,
        full_name: testTeacher.name,
        role: 'teacher',
        verified: true,
        is_test_mode: true,
      }
      
      // Store in sessionStorage (clears on browser close)
      sessionStorage.setItem('teacher_token', JSON.stringify(testTeacher))
      sessionStorage.setItem('teacher_data', JSON.stringify(testTeacherData))
      sessionStorage.setItem('is_teacher_test_mode', 'true')
      
      // Redirect to dashboard
      navigate('/teacher/dashboard')
      return
    }

    // Validate teacher code OR school key (required for non-testsecure)
    const hasTeacherCode = formData.teacherCode && validTeacherCodes.includes(formData.teacherCode.toUpperCase().trim())
    const hasSchoolKey = formData.schoolKey && formData.schoolKey.startsWith('SCH-')
    
    if (!hasTeacherCode && !hasSchoolKey) {
      setError('Either a valid teacher code or school key is required. Please contact your institution or use the invite link provided.')
      return
    }

    // Validation (only if not testsecure)
    if (formData.password.length < 10) {
      setError('Password must be at least 10 characters')
      return
    }

    if (!/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      setError('Password must contain both letters and numbers')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/teachers/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          teacherCode: formData.teacherCode ? formData.teacherCode.toUpperCase().trim() : null,
          schoolKey: formData.schoolKey ? formData.schoolKey.toUpperCase().trim() : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }

      // Redirect to verification page
      navigate(`/teacher/verify-email?token=${data.verificationToken}`)
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
            Create Teacher Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/teacher/login" className="font-medium text-curare-blue hover:text-blue-700">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {formData.name.toLowerCase() === 'testsecure' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Developer Test Mode:</strong> This will create a temporary session that doesn't save to the database. All data will be cleared when you log out.
              </p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={formData.name.toLowerCase() !== 'testsecure'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
            </div>
            {schoolInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>School:</strong> {schoolInfo.name}
                </p>
              </div>
            )}
            <div>
              <label htmlFor="schoolKey" className="block text-sm font-medium text-gray-700">
                School Key (if you have an invite link)
              </label>
              <input
                id="schoolKey"
                name="schoolKey"
                type="text"
                value={formData.schoolKey}
                onChange={(e) => setFormData({ ...formData, schoolKey: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue uppercase"
                placeholder="SCH-XXXXXX"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your school key if you received an invite link, or use a teacher code below
              </p>
            </div>
            <div>
              <label htmlFor="teacherCode" className="block text-sm font-medium text-gray-700">
                Teacher Code {formData.name.toLowerCase() !== 'testsecure' && !formData.schoolKey && '*'}
              </label>
              <input
                id="teacherCode"
                name="teacherCode"
                type="text"
                required={formData.name.toLowerCase() !== 'testsecure' && !formData.schoolKey}
                value={formData.teacherCode}
                onChange={(e) => setFormData({ ...formData, teacherCode: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your institution teacher code"
                disabled={formData.name.toLowerCase() === 'testsecure' || !!formData.schoolKey}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            {formData.name.toLowerCase() !== 'testsecure' && (
              <>
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                  />
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
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 10 characters with letters and numbers
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                  />
                </div>
              </>
            )}
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-curare-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-curare-blue disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TeacherSignup

