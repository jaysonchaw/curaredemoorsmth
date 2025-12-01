import { useState, useEffect } from 'react'
import AssignmentBuilder from './AssignmentBuilder'

const AssignmentsTab = ({ classroomId }) => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)

  useEffect(() => {
    fetchAssignments()
  }, [classroomId])

  const fetchAssignments = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Load from localStorage (shared across tabs) or use default mock data
        const stored = localStorage.getItem('test_assignments') || sessionStorage.getItem('test_assignments')
        if (stored) {
          const assignments = JSON.parse(stored)
          setAssignments(assignments)
        } else {
          // Initialize with mock data if none exists
          const mockAssignments = [
            {
              id: '1',
              title: 'Introduction to Cells',
              status: 'published',
              due_date: new Date().toISOString(),
              submission_count: 5,
              total_points: 20,
            },
          ]
          localStorage.setItem('test_assignments', JSON.stringify(mockAssignments))
          setAssignments(mockAssignments)
        }
        setLoading(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/assignments/classrooms/${classroomId}`, {
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (assignment) => {
    const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
    
    if (isTestMode) {
      // Save to localStorage (shared across tabs) in test mode
      const stored = localStorage.getItem('test_assignments') || sessionStorage.getItem('test_assignments')
      const assignments = stored ? JSON.parse(stored) : []
      
      if (editingAssignment) {
        // Update existing
        const index = assignments.findIndex(a => a.id === editingAssignment.id)
        if (index !== -1) {
          assignments[index] = { ...assignment, submission_count: assignments[index].submission_count || 0 }
        }
      } else {
        // Add new
        assignments.push({ ...assignment, submission_count: 0 })
      }
      
      localStorage.setItem('test_assignments', JSON.stringify(assignments))
    }
    
    setShowBuilder(false)
    setEditingAssignment(null)
    fetchAssignments()
  }

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment)
    setShowBuilder(true)
  }

  const handleDelete = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode deletion
        const testAssignments = JSON.parse(localStorage.getItem('test_assignments') || sessionStorage.getItem('test_assignments') || '[]')
        const updated = testAssignments.filter(a => a.id !== assignmentId)
        localStorage.setItem('test_assignments', JSON.stringify(updated))
        fetchAssignments()
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        return
      }

      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        fetchAssignments()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete assignment' }))
        alert(errorData.error || 'Failed to delete assignment')
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      alert('Error deleting assignment. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (showBuilder) {
    return (
      <AssignmentBuilder
        classroomId={classroomId}
        assignment={editingAssignment}
        onSave={handleSave}
        onCancel={() => {
          setShowBuilder(false)
          setEditingAssignment(null)
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-curare-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
        <button
          onClick={() => {
            setEditingAssignment(null)
            setShowBuilder(true)
          }}
          className="px-4 py-2 bg-curare-blue text-white rounded-lg hover:bg-blue-700"
        >
          Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submissions
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                  {assignment.description && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {assignment.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      assignment.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : assignment.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {assignment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(assignment.due_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assignment.total_points || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {assignment.submission_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => window.location.href = `/teacher/classrooms/${classroomId}/assignments/${assignment.id}/submissions`}
                      className="text-curare-blue hover:text-blue-700"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No assignments yet. Create your first assignment to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignmentsTab

