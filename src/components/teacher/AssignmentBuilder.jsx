import { useState } from 'react'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'fill_in_blank', label: 'Fill in the Blank' },
  { value: 'fill_in_box', label: 'Free Text (Fill in Box)' },
  { value: 'open_text', label: 'Open Response' },
  { value: 'sequence', label: 'Sequence/Ordering' },
  { value: 'timed_task', label: 'Timed Task' },
]

const AssignmentBuilder = ({ classroomId, assignment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    dueDate: assignment?.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '',
    visibilityStart: assignment?.visibility_start ? new Date(assignment.visibility_start).toISOString().slice(0, 16) : '',
    visibilityEnd: assignment?.visibility_end ? new Date(assignment.visibility_end).toISOString().slice(0, 16) : '',
    targetLessons: assignment?.target_lessons || [],
    status: assignment?.status || 'draft',
  })
  const [questions, setQuestions] = useState(assignment?.questions || [])
  const [saving, setSaving] = useState(false)

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      body: '',
      options: type === 'multiple_choice' ? { options: [], correct: [] } : {},
      points: 1,
      metadata: { hint: '', adaptiveEnabled: false },
      order_index: questions.length,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id).map((q, index) => ({ ...q, order_index: index })))
  }

  const reorderQuestion = (fromIndex, toIndex) => {
    const newQuestions = Array.from(questions)
    const [moved] = newQuestions.splice(fromIndex, 1)
    newQuestions.splice(toIndex, 0, moved)
    setQuestions(newQuestions.map((q, index) => ({ ...q, order_index: index })))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Mock save for test mode
        const savedAssignment = {
          id: assignment?.id || Date.now().toString(),
          ...formData,
          questions,
        }
        onSave(savedAssignment)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const url = assignment
        ? `http://localhost:3001/api/assignments/${assignment.id}`
        : `http://localhost:3001/api/assignments/classrooms/${classroomId}`
      
      const method = assignment ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate || null,
          visibilityStart: formData.visibilityStart || null,
          visibilityEnd: formData.visibilityEnd || null,
          questions: questions.map(({ id, ...q }) => q),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data)
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!assignment?.id) {
      // Save as draft first, then publish
      await handleSubmit(new Event('submit'))
      // Wait a bit for save to complete
      setTimeout(async () => {
        await publishAssignment(assignment?.id)
      }, 500)
    } else {
      await publishAssignment(assignment.id)
    }
  }

  const publishAssignment = async (assignmentId) => {
    try {
      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}/publish`, {
        method: 'POST',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        onSave(data)
      }
    } catch (error) {
      console.error('Error publishing assignment:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility Start
              </label>
              <input
                type="datetime-local"
                value={formData.visibilityStart}
                onChange={(e) => setFormData({ ...formData, visibilityStart: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visibility End
              </label>
              <input
                type="datetime-local"
                value={formData.visibilityEnd}
                onChange={(e) => setFormData({ ...formData, visibilityEnd: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <div className="flex space-x-2">
            {QUESTION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => addQuestion(type.value)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                + {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
              onMoveUp={index > 0 ? () => reorderQuestion(index, index - 1) : null}
              onMoveDown={index < questions.length - 1 ? () => reorderQuestion(index, index + 1) : null}
            />
          ))}
          {questions.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Click a question type above to add your first question.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        {assignment?.id && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={saving || formData.status === 'published'}
            className="px-4 py-2 bg-curare-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {formData.status === 'published' ? 'Published' : 'Publish'}
          </button>
        )}
      </div>
    </form>
  )
}

const QuestionEditor = ({ question, index, onUpdate, onDelete, onMoveUp, onMoveDown }) => {
  const updateField = (field, value) => {
    onUpdate({ [field]: value })
  }

  const updateOptions = (field, value) => {
    onUpdate({ options: { ...question.options, [field]: value } })
  }

  const updateMetadata = (field, value) => {
    onUpdate({ metadata: { ...question.metadata, [field]: value } })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
          <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
            {QUESTION_TYPES.find(t => t.value === question.type)?.label}
          </span>
        </div>
        <div className="flex space-x-2">
          {onMoveUp && (
            <button
              type="button"
              onClick={onMoveUp}
              className="text-gray-400 hover:text-gray-600"
            >
              ↑
            </button>
          )}
          {onMoveDown && (
            <button
              type="button"
              onClick={onMoveDown}
              className="text-gray-400 hover:text-gray-600"
            >
              ↓
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="text-red-400 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Body *
          </label>
          <textarea
            value={question.body}
            onChange={(e) => updateField('body', e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            placeholder="Enter your question..."
          />
        </div>

        {question.type === 'multiple_choice' && (
          <MultipleChoiceEditor
            options={question.options}
            onUpdate={updateOptions}
          />
        )}

        {question.type === 'fill_in_blank' && (
          <FillInBlankEditor
            options={question.options}
            onUpdate={updateOptions}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Points
            </label>
            <input
              type="number"
              min="1"
              value={question.points || 1}
              onChange={(e) => updateField('points', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.metadata?.adaptiveEnabled || false}
                onChange={(e) => updateMetadata('adaptiveEnabled', e.target.checked)}
                className="rounded border-gray-300 text-curare-blue focus:ring-curare-blue"
              />
              <span className="text-sm text-gray-700">Adaptive-enabled</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hint (optional)
          </label>
          <input
            type="text"
            value={question.metadata?.hint || ''}
            onChange={(e) => updateMetadata('hint', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            placeholder="Provide a hint for students..."
          />
        </div>
      </div>
    </div>
  )
}

const MultipleChoiceEditor = ({ options, onUpdate }) => {
  const [localOptions, setLocalOptions] = useState(options?.options || ['', ''])
  const [correctAnswers, setCorrectAnswers] = useState(options?.correct || [])

  const addOption = () => {
    const newOptions = [...localOptions, '']
    setLocalOptions(newOptions)
    onUpdate({ options: newOptions, correct: correctAnswers })
  }

  const updateOption = (index, value) => {
    const newOptions = [...localOptions]
    newOptions[index] = value
    setLocalOptions(newOptions)
    onUpdate({ options: newOptions, correct: correctAnswers })
  }

  const toggleCorrect = (index) => {
    const newCorrect = correctAnswers.includes(index)
      ? correctAnswers.filter(i => i !== index)
      : [...correctAnswers, index]
    setCorrectAnswers(newCorrect)
    onUpdate({ options: localOptions, correct: newCorrect })
  }

  const removeOption = (index) => {
    const newOptions = localOptions.filter((_, i) => i !== index)
    setLocalOptions(newOptions)
    const newCorrect = correctAnswers.filter(i => i !== index).map(i => i > index ? i - 1 : i)
    setCorrectAnswers(newCorrect)
    onUpdate({ options: newOptions, correct: newCorrect })
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Options (check correct answers)
      </label>
      {localOptions.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={correctAnswers.includes(index)}
            onChange={() => toggleCorrect(index)}
            className="rounded border-gray-300 text-curare-blue focus:ring-curare-blue"
          />
          <input
            type="text"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
          />
          {localOptions.length > 2 && (
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addOption}
        className="text-sm text-curare-blue hover:text-blue-700"
      >
        + Add Option
      </button>
    </div>
  )
}

const FillInBlankEditor = ({ options, onUpdate }) => {
  const [pattern, setPattern] = useState(options?.pattern || '')
  const [synonyms, setSynonyms] = useState(options?.synonyms || [])

  const addSynonym = () => {
    const newSynonyms = [...synonyms, '']
    setSynonyms(newSynonyms)
    onUpdate({ pattern, synonyms: newSynonyms })
  }

  const updateSynonym = (index, value) => {
    const newSynonyms = [...synonyms]
    newSynonyms[index] = value
    setSynonyms(newSynonyms)
    onUpdate({ pattern, synonyms: newSynonyms })
  }

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correct Answer Pattern (regex)
        </label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => {
            setPattern(e.target.value)
            onUpdate({ pattern: e.target.value, synonyms })
          }}
          placeholder="e.g., heart|cardiac"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Acceptable Synonyms
        </label>
        {synonyms.map((synonym, index) => (
          <div key={index} className="flex space-x-2 mb-2">
            <input
              type="text"
              value={synonym}
              onChange={(e) => updateSynonym(index, e.target.value)}
              placeholder="Synonym"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-curare-blue focus:border-curare-blue"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addSynonym}
          className="text-sm text-curare-blue hover:text-blue-700"
        >
          + Add Synonym
        </button>
      </div>
    </div>
  )
}

export default AssignmentBuilder

























