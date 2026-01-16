import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { supabase } from '../../services/authService'

const Profile = () => {
  const { userData, setUserData } = useOutletContext()
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingTimeGoal, setIsEditingTimeGoal] = useState(false)
  const [editedName, setEditedName] = useState(userData?.full_name || '')
  const [editedTimeGoal, setEditedTimeGoal] = useState(userData?.daily_time_minutes || 30)

  // Update local state when userData changes
  useEffect(() => {
    if (userData) {
      setEditedName(userData.full_name || '')
      setEditedTimeGoal(userData.daily_time_minutes || 30)
    }
  }, [userData])
  const [isSaving, setIsSaving] = useState(false)
  const hasParentConsent = userData?.parent_consent || false
  const isUnder18 = userData?.birthday ? (() => {
    const birthDate = new Date(userData.birthday)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    return (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) ? age - 1 : age < 18
  })() : false

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      alert('Name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Test mode: update sessionStorage
        const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
        testUserData.full_name = editedName.trim()
        sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
        setUserData({ ...userData, full_name: editedName.trim() })
        setIsEditingName(false)
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { error } = await supabase
            .from('users')
            .update({ full_name: editedName.trim() })
            .eq('id', session.user.id)

          if (error) throw error

          // Update local userData
          setUserData({ ...userData, full_name: editedName.trim() })
          setIsEditingName(false)
        }
      }
    } catch (error) {
      console.error('Error saving name:', error)
      alert('Failed to save name. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTimeGoal = async () => {
    const timeGoal = parseInt(editedTimeGoal)
    if (isNaN(timeGoal) || timeGoal < 1 || timeGoal > 1440) {
      alert('Please enter a valid time goal between 1 and 1440 minutes')
      return
    }

    setIsSaving(true)
    try {
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      if (isTestMode) {
        // Test mode: update sessionStorage
        const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
        testUserData.daily_time_minutes = timeGoal
        sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
        setUserData({ ...userData, daily_time_minutes: timeGoal })
        setIsEditingTimeGoal(false)
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { error } = await supabase
            .from('users')
            .update({ daily_time_minutes: timeGoal })
            .eq('id', session.user.id)

          if (error) throw error

          // Update local userData
          setUserData({ ...userData, daily_time_minutes: timeGoal })
          setIsEditingTimeGoal(false)
        }
      }
    } catch (error) {
      console.error('Error saving time goal:', error)
      alert('Failed to save time goal. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and view linked parent information</p>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isSaving}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingName(false)
                    setEditedName(userData?.full_name || '')
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900">{userData?.full_name || 'Not set'}</p>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-sm text-curare-blue hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{userData?.email || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ULI (Unique Learner Identifier)</label>
            <p className="text-gray-900 font-mono">{userData?.uli || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
            <p className="text-gray-900">Group {userData?.group_number || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">XP</label>
            <p className="text-gray-900">{userData?.xp || 0} XP</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <p className="text-gray-900">Level {userData?.level || 1}</p>
          </div>
        </div>
      </div>

      {/* Parent Information */}
      {(isUnder18 || userData?.parent_email) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Linked Parent/Guardian</h2>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Note:</strong> Parent email is only used for consent verification during signup. Your login email is shown above.
          </p>
          {userData?.parent_email ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Email (Verification Only)</label>
                <p className="text-gray-900">{userData.parent_email}</p>
                <p className="text-xs text-gray-500 mt-1">This email is not used for login</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent Status</label>
                {hasParentConsent ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Consent Received
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending Consent
                      </span>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Limited Mode:</strong> Your parent/guardian consent is pending. Some features may be restricted until consent is received.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No parent email on file</p>
          )}
        </div>
      )}

      {/* Learning Preferences */}
      {userData?.selected_path && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selected Path</label>
              <p className="text-gray-900">{userData.selected_path}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Daily Time Goal</label>
              {isEditingTimeGoal ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={editedTimeGoal}
                    onChange={(e) => setEditedTimeGoal(e.target.value)}
                    min="1"
                    max="1440"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                    placeholder="Minutes"
                    disabled={isSaving}
                  />
                  <span className="text-gray-600">minutes per day</span>
                  <button
                    onClick={handleSaveTimeGoal}
                    disabled={isSaving}
                    className="px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTimeGoal(false)
                      setEditedTimeGoal(userData?.daily_time_minutes || 30)
                    }}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-900">{userData?.daily_time_minutes || 30} minutes per day</p>
                  <button
                    onClick={() => setIsEditingTimeGoal(true)}
                    className="text-sm text-curare-blue hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile

