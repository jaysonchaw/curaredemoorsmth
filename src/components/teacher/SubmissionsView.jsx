import { useState, useEffect } from 'react'

const SubmissionsView = ({ assignmentId, classroomId }) => {
  const [submissions, setSubmissions] = useState([])
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    studentName: '',
    graded: '',
  })
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  useEffect(() => {
    fetchAssignment()
    fetchSubmissions()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}`, {
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      }
    } catch (error) {
      console.error('Error fetching assignment:', error)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const queryParams = new URLSearchParams()
      if (filters.studentName) queryParams.append('studentName', filters.studentName)
      if (filters.graded) queryParams.append('graded', filters.graded)

      const response = await fetch(
        `http://localhost:3001/api/submissions/assignments/${assignmentId}/submissions?${queryParams}`,
        {
          headers: {
            'x-teacher-id': teacherData.id,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (submissionId, score, comments) => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const response = await fetch(`http://localhost:3001/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify({ score, teacherComments: comments }),
      })

      if (response.ok) {
        fetchSubmissions()
        setSelectedSubmission(null)
      }
    } catch (error) {
      console.error('Error grading submission:', error)
    }
  }

  const handleAutograde = async () => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const response = await fetch(`http://localhost:3001/api/submissions/assignments/${assignmentId}/autograde`, {
        method: 'POST',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        fetchSubmissions()
      }
    } catch (error) {
      console.error('Error autograding:', error)
    }
  }

  const exportCSV = () => {
    const csvRows = [
      ['Student ID', 'Student Name', 'Email', 'Assignment ID', 'Score', 'Graded At', 'Comments'],
    ]

    submissions.forEach((submission) => {
      csvRows.push([
        submission.student_id,
        submission.student?.full_name || '',
        submission.student?.email || '',
        assignmentId,
        submission.score || '',
        submission.graded_at || '',
        submission.teacher_comments || '',
      ])
    })

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades_${assignmentId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {assignment?.title || 'Submissions'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleAutograde}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Autograde MCQs
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={filters.studentName}
              onChange={(e) => setFilters({ ...filters, studentName: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && fetchSubmissions()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              placeholder="Search by name..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.graded}
              onChange={(e) => {
                setFilters({ ...filters, graded: e.target.value })
                fetchSubmissions()
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            >
              <option value="">All</option>
              <option value="true">Graded</option>
              <option value="false">Ungraded</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchSubmissions}
              className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {submission.student?.full_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {submission.student?.email || ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {submission.score !== null ? (
                    <span className="text-sm font-medium text-gray-900">
                      {submission.score} / {assignment?.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">Not graded</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      submission.graded
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {submission.graded ? 'Graded' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="text-curare-blue hover:text-blue-700"
                  >
                    Grade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {selectedSubmission && assignment && (
        <GradingModal
          submission={selectedSubmission}
          assignment={assignment}
          onGrade={handleGrade}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  )
}

const GradingModal = ({ submission, assignment, onGrade, onClose }) => {
  const [score, setScore] = useState(submission.score || '')
  const [comments, setComments] = useState(submission.teacher_comments || '')
  const [grading, setGrading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGrading(true)
    await onGrade(submission.id, parseFloat(score), comments)
    setGrading(false)
  }

  const maxScore = assignment.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Grade Submission - {submission.student?.full_name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {assignment.questions?.map((question, index) => {
              const answer = submission.answers?.[index]
              const isCorrect = question.type === 'multiple_choice' && 
                JSON.stringify(answer) === JSON.stringify(question.options?.correct)

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Question {index + 1} ({question.points || 1} points)
                        </span>
                        {question.type === 'multiple_choice' && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 mb-2">{question.body}</p>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-600 mb-1">Student Answer:</p>
                        <p className="text-gray-900">
                          {Array.isArray(answer) ? answer.join(', ') : answer || 'No answer'}
                        </p>
                        {question.type === 'multiple_choice' && question.options?.correct && (
                          <p className="text-sm text-green-700 mt-2">
                            Correct: {Array.isArray(question.options.correct) 
                              ? question.options.correct.join(', ')
                              : question.options.correct}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <form onSubmit={handleSubmit} className="border-t pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score (out of {maxScore})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxScore}
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
                    placeholder="Add feedback for the student..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {grading ? 'Grading...' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubmissionsView

