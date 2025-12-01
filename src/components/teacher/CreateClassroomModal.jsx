import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CreateClassroomModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: '',
    ageRange: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdClassroom, setCreatedClassroom] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check for test mode
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Test mode: create classroom in localStorage (shared across tabs)
        const testTeacher = JSON.parse(sessionStorage.getItem('teacher_token') || '{}')
        // Generate 7-character code matching backend format (excludes O,0,I,1,L)
        const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
        let testCode = ''
        for (let i = 0; i < 7; i++) {
          testCode += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
        }
        
        // Ensure code is uppercase and has no spaces
        testCode = testCode.toUpperCase().trim()
        
        const testClassroom = {
          id: 'test-classroom-' + Date.now(),
          teacher_id: testTeacher.id,
          name: formData.name,
          description: formData.description,
          grade: formData.grade,
          age_range: formData.ageRange,
          code: testCode,
          created_at: new Date().toISOString(),
        }
        
        // Store in localStorage so it's shared across tabs (but cleared on teacher logout)
        const testClassrooms = JSON.parse(localStorage.getItem('test_classrooms') || '[]')
        testClassrooms.push(testClassroom)
        localStorage.setItem('test_classrooms', JSON.stringify(testClassrooms))
        
        setCreatedClassroom(testClassroom)
        setLoading(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch('http://localhost:3001/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create classroom')
        setLoading(false)
        return
      }

      setCreatedClassroom(data)
      setLoading(false)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdClassroom.code)
    alert('Code copied to clipboard!')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        >
          {!createdClassroom ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Create Classroom</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classroom Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    placeholder="e.g., Form 1 Biology A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    placeholder="Year 7 biology cohort"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                      placeholder="Form 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <input
                      type="text"
                      value={formData.ageRange}
                      onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                      placeholder="12-13"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Classroom'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Classroom Created!</h2>
              <p className="text-gray-600 mb-6">Share this code with students to join your classroom:</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-curare-blue">
                    {createdClassroom.code}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1 bg-curare-blue text-white rounded text-sm hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Students join at curare.carrd.co/join
              </p>

              <button
                onClick={() => {
                  setCreatedClassroom(null)
                  setFormData({ name: '', description: '', grade: '', ageRange: '' })
                  onSuccess(createdClassroom)
                  onClose()
                }}
                className="w-full px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateClassroomModal

