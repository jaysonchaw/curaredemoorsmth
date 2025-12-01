import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { userData, setUserData } = useOutletContext()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [selectedPath, setSelectedPath] = useState('Pre-Med')

  const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'

  useEffect(() => {
    if (!isTestMode) {
      navigate('/dashboard')
      return
    }

    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('id, title, path_type, order_index')
          .order('path_type', { ascending: true })
          .order('order_index', { ascending: true })

        if (error) {
          console.error('Error fetching lessons:', error)
          setLessons([])
        } else {
          setLessons(data || [])
        }
      } catch (error) {
        console.error('Error:', error)
        setLessons([])
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [isTestMode, navigate])

  const handleEditField = (fieldName, currentValue) => {
    setEditingField(fieldName)
    setEditValue(currentValue?.toString() || '')
  }

  const handleSaveField = async () => {
    if (!editingField) return

    const newValue = editingField === 'xp' || editingField === 'level' || editingField === 'daily_time_minutes' || editingField === 'group_number'
      ? parseInt(editValue) || 0
      : editValue

    if (isTestMode) {
      // Update sessionStorage
      const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
      testUserData[editingField] = newValue
      sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
      setUserData({ ...userData, [editingField]: newValue })
    } else {
      // Update database
      const { error } = await supabase
        .from('users')
        .update({ [editingField]: newValue })
        .eq('id', userData.id)

      if (error) {
        console.error('Error updating field:', error)
        alert('Error updating field: ' + error.message)
        return
      }

      setUserData({ ...userData, [editingField]: newValue })
    }

    setEditingField(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleJumpToLesson = (lessonId) => {
    navigate(`/dashboard/lesson/${lessonId}`)
  }

  const editableFields = [
    { key: 'xp', label: 'XP', type: 'number' },
    { key: 'level', label: 'Level', type: 'number' },
    { key: 'full_name', label: 'Full Name', type: 'text' },
    { key: 'daily_time_minutes', label: 'Daily Time Goal (minutes)', type: 'number' },
    { key: 'selected_path', label: 'Selected Path', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'group_number', label: 'Group Number', type: 'number' }
  ]

  const filteredLessons = lessons.filter(l => l.path_type === selectedPath)

  if (!isTestMode) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-yellow-900 mb-2">🔧 Developer Admin Panel</h1>
        <p className="text-yellow-800 text-sm">
          This panel is only available in test mode. Use it to skip to lessons, jump to questions, and modify user data.
        </p>
      </div>

      {/* User Variables Editor */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit User Variables</h2>
        <p className="text-sm text-gray-600 mb-4">
          Edit any user variable except ULI (which confirms developer status)
        </p>
        
        <div className="space-y-4">
          {editableFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {editingField === field.key ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type={field.type}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveField}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {userData?.[field.key] !== undefined && userData?.[field.key] !== null
                      ? userData[field.key].toString()
                      : 'Not set'}
                  </p>
                )}
              </div>
              {editingField !== field.key && (
                <button
                  onClick={() => handleEditField(field.key, userData?.[field.key])}
                  className="ml-4 px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
          
          {/* ULI - Read Only */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ULI (Read Only - Developer Identifier)
              </label>
              <p className="text-gray-900 font-mono">{userData?.uli || 'Not set'}</p>
            </div>
            <span className="ml-4 px-3 py-1 bg-gray-200 text-gray-600 rounded-md text-sm">
              Protected
            </span>
          </div>
        </div>
      </div>

      {/* Jump to Lesson */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Jump to Any Lesson</h2>
        
        {/* Path Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Path:</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPath('Pre-Med')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPath === 'Pre-Med'
                  ? 'bg-curare-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pre-Med
            </button>
            <button
              onClick={() => setSelectedPath('Med')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPath === 'Med'
                  ? 'bg-curare-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Med
            </button>
            <button
              onClick={() => setSelectedPath('All')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPath === 'All'
                  ? 'bg-curare-blue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-curare-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading lessons...</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(selectedPath === 'All' ? lessons : filteredLessons).map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{lesson.title}</p>
                  <p className="text-sm text-gray-500">
                    {lesson.path_type} • Lesson {lesson.order_index}
                  </p>
                </div>
                <button
                  onClick={() => handleJumpToLesson(lesson.id)}
                  className="ml-4 px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Jump
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to Skip to Questions</h3>
        <p className="text-sm text-blue-800">
          After jumping to a lesson, you'll see an admin control panel at the top of the lesson player
          that allows you to skip to any step (Content, Task, Follow-up, Quiz) and any question within each section.
        </p>
      </div>
    </div>
  )
}

export default AdminPanel

