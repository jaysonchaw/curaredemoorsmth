import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PilotSignupModal = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    expectedStudents: '',
    preferredStartWeeks: [],
    pilotType: '',
    notes: '',
    acceptTOS: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [schoolKey, setSchoolKey] = useState('')

  const weekOptions = [
    'Week 1-2',
    'Week 3-4',
    'Week 5-6',
    'Week 7-8',
    'Week 9-10',
    'Week 11-12',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Prevent sponsored pilot selection
    if (formData.pilotType === 'sponsored') {
      setError('Sponsored Pilot is currently unavailable. Please select Free or Paid Pilot.')
      return
    }
    
    setLoading(true)

    try {
      // Check if server is running, use environment variable or default to localhost
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      
      const response = await fetch(`${API_URL}/api/partners/request-pilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          contactName: formData.contactName,
          contactRole: formData.contactRole,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          city: formData.city,
          expectedStudents: formData.expectedStudents ? parseInt(formData.expectedStudents) : null,
          preferredStartWeeks: formData.preferredStartWeeks,
          pilotType: formData.pilotType,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (data.schoolKey) {
        setSchoolKey(data.schoolKey)
        setSuccess(true)
        
        // Log analytics
        if (window.gtag) {
          window.gtag('event', 'pilot_requested', {
            school_name: formData.name,
            pilot_type: formData.pilotType,
          })
        }
      } else {
        throw new Error('No school key received from server')
      }
    } catch (error) {
      console.error('Error submitting pilot request:', error)
      // Provide helpful error message
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setError('Unable to connect to server. Please make sure the backend server is running on port 3001, or contact support.')
      } else {
        setError(error.message || 'Failed to submit pilot request. Please try again or contact support.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeacherAccount = () => {
    // Navigate to teacher signup with pre-filled school key
    navigate(`/teacher/signup?invite=${schoolKey}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {!success ? (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Request a Pilot</h2>
                <button
                  type="button"
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

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                  >
                    <option value="">Select type</option>
                    <option value="homeschool">Homeschool</option>
                    <option value="private">Private School</option>
                    <option value="international">International School</option>
                    <option value="public">Public School</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Role
                    </label>
                    <input
                      type="text"
                      value={formData.contactRole}
                      onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                      placeholder="e.g., Principal, Science Coordinator"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Students
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.expectedStudents}
                      onChange={(e) => setFormData({ ...formData, expectedStudents: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Start Weeks
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {weekOptions.map((week) => (
                      <label key={week} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredStartWeeks.includes(week)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                preferredStartWeeks: [...formData.preferredStartWeeks, week],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                preferredStartWeeks: formData.preferredStartWeeks.filter((w) => w !== week),
                              })
                            }
                          }}
                          className="rounded border-gray-300 text-curare-blue focus:ring-curare-blue"
                        />
                        <span className="text-sm text-gray-700">{week}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilot Type *
                  </label>
                  <select
                    required
                    value={formData.pilotType}
                    onChange={(e) => setFormData({ ...formData, pilotType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                  >
                    <option value="">Select pilot type</option>
                    <option value="free">Free 4-Week Pilot</option>
                    <option value="paid">Paid Pilot</option>
                    <option value="sponsored" disabled>Sponsored Pilot (Currently Unavailable)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Sponsored Pilot is currently unavailable. Please select Free or Paid Pilot.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    placeholder="Any additional information about your school or pilot needs..."
                  />
                </div>

                <div>
                  <label className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acceptTOS}
                      onChange={(e) => setFormData({ ...formData, acceptTOS: e.target.checked })}
                      className="mt-1 rounded border-gray-300 text-curare-blue focus:ring-curare-blue"
                    />
                    <span className="text-sm text-gray-700">
                      I accept the{' '}
                      <a href="/terms-of-service" target="_blank" className="text-curare-blue hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy-policy" target="_blank" className="text-curare-blue hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
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
                  className="px-6 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pilot Request Submitted!</h2>
                <p className="text-gray-600 mb-6">
                  We've received your request and will contact you shortly. In the meantime, you can start setting up your teacher account.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-gray-900 mb-2">Your School Access Key:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="text-2xl font-mono font-bold text-curare-blue">{schoolKey}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(schoolKey)
                        alert('School key copied to clipboard!')
                      }}
                      className="px-3 py-1 text-xs bg-curare-blue text-white rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Share this key with teachers to invite them to your school
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleCreateTeacherAccount}
                    className="px-6 py-3 bg-curare-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Create Teacher Account Now
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PilotSignupModal

