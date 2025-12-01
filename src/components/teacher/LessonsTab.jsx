import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const LessonsTab = ({ classroomId }) => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchLessons()
  }, [classroomId])

  const fetchLessons = async () => {
    try {
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Load from localStorage (shared across tabs) or use default mock data
        const stored = localStorage.getItem('test_classroom_lessons') || sessionStorage.getItem('test_classroom_lessons')
        if (stored) {
          const lessons = JSON.parse(stored)
          setLessons(lessons)
        } else {
          // Initialize with mock data if none exists
          const mockLessons = [
            { id: '1', title: 'Introduction to Medicine', path_type: 'Med', order_index: 1, locked: false, mandatory: false, seq_order: null, is_mapped: false, classroom_lesson_id: null },
            { id: '2', title: 'The Human Body', path_type: 'Pre-Med', order_index: 1, locked: false, mandatory: false, seq_order: null, is_mapped: false, classroom_lesson_id: null },
          ]
          localStorage.setItem('test_classroom_lessons', JSON.stringify(mockLessons))
          setLessons(mockLessons)
        }
        setLoading(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      
      const response = await fetch(`http://localhost:3001/api/lessons/classrooms/${classroomId}`, {
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Error fetching lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(lessons)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update seq_order for mapped items
    const updatedItems = items.map((item, index) => {
      if (item.is_mapped) {
        return { ...item, seq_order: index + 1 }
      }
      return item
    })

    setLessons(updatedItems)

    // Save new order if item was mapped
    if (reorderedItem.is_mapped) {
      await updateLessonMapping(reorderedItem.classroom_lesson_id, { seqOrder: result.destination.index + 1 })
    }
  }

  const toggleLock = async (lesson) => {
    if (!lesson.is_mapped) {
      // Create mapping first
      await createLessonMapping(lesson.id, { locked: true })
    } else {
      await updateLessonMapping(lesson.classroom_lesson_id, { locked: !lesson.locked })
    }
  }

  const toggleMandatory = async (lesson) => {
    if (!lesson.is_mapped) {
      await createLessonMapping(lesson.id, { mandatory: true })
    } else {
      await updateLessonMapping(lesson.classroom_lesson_id, { mandatory: !lesson.mandatory })
    }
  }

  const createLessonMapping = async (lessonId, options = {}) => {
    try {
      setSaving(true)
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode creation - use localStorage (shared across tabs)
        const stored = localStorage.getItem('test_classroom_lessons') || sessionStorage.getItem('test_classroom_lessons')
        const lessons = stored ? JSON.parse(stored) : []
        const lesson = lessons.find(l => l.id === lessonId)
        if (lesson) {
          lesson.is_mapped = true
          lesson.classroom_lesson_id = `cl-${Date.now()}`
          lesson.locked = options.locked ?? false
          lesson.mandatory = options.mandatory ?? false
          lesson.seq_order = options.seqOrder ?? (lessons.filter(l => l.is_mapped).length + 1)
          localStorage.setItem('test_classroom_lessons', JSON.stringify(lessons))
          setLessons(lessons)
        }
        setSaving(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        setSaving(false)
        return
      }
      
      const response = await fetch(`http://localhost:3001/api/lessons/classrooms/${classroomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify({
          lessonId,
          seqOrder: options.seqOrder,
          mandatory: options.mandatory ?? false,
          locked: options.locked ?? false,
        }),
      })

      if (response.ok) {
        await fetchLessons()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create lesson mapping' }))
        alert(errorData.error || 'Failed to create lesson mapping')
      }
    } catch (error) {
      console.error('Error creating lesson mapping:', error)
      alert('Error creating lesson mapping. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateLessonMapping = async (classroomLessonId, updates) => {
    try {
      setSaving(true)
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode update - use localStorage (shared across tabs)
        const stored = localStorage.getItem('test_classroom_lessons') || sessionStorage.getItem('test_classroom_lessons')
        const lessons = stored ? JSON.parse(stored) : []
        const lesson = lessons.find(l => l.classroom_lesson_id === classroomLessonId)
        if (lesson) {
          if (updates.locked !== undefined) lesson.locked = updates.locked
          if (updates.mandatory !== undefined) lesson.mandatory = updates.mandatory
          if (updates.seqOrder !== undefined) lesson.seq_order = updates.seqOrder
          localStorage.setItem('test_classroom_lessons', JSON.stringify(lessons))
          setLessons(lessons)
        }
        setSaving(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        setSaving(false)
        return
      }
      
      const response = await fetch(`http://localhost:3001/api/lessons/classrooms/${classroomId}/lessons/${classroomLessonId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-teacher-id': teacherData.id,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchLessons()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update lesson mapping' }))
        alert(errorData.error || 'Failed to update lesson mapping')
      }
    } catch (error) {
      console.error('Error updating lesson mapping:', error)
      alert('Error updating lesson mapping. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const removeLessonMapping = async (classroomLessonId) => {
    try {
      setSaving(true)
      const isTestMode = sessionStorage.getItem('is_teacher_test_mode') === 'true'
      
      if (isTestMode) {
        // Handle test mode deletion - use localStorage (shared across tabs)
        const testLessons = JSON.parse(localStorage.getItem('test_classroom_lessons') || sessionStorage.getItem('test_classroom_lessons') || '[]')
        const updated = testLessons.filter(l => l.classroom_lesson_id !== classroomLessonId)
        localStorage.setItem('test_classroom_lessons', JSON.stringify(updated))
        await fetchLessons()
        setSaving(false)
        return
      }

      const teacherData = JSON.parse(localStorage.getItem('teacher_token'))
      if (!teacherData) {
        alert('Not authenticated. Please log in again.')
        setSaving(false)
        return
      }
      
      const response = await fetch(`http://localhost:3001/api/lessons/classrooms/${classroomId}/lessons/${classroomLessonId}`, {
        method: 'DELETE',
        headers: {
          'x-teacher-id': teacherData.id,
        },
      })

      if (response.ok) {
        await fetchLessons()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to remove lesson mapping' }))
        alert(errorData.error || 'Failed to remove lesson mapping')
      }
    } catch (error) {
      console.error('Error removing lesson mapping:', error)
      alert('Error removing lesson mapping. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const previewLesson = (lessonId) => {
    // Open lesson preview in new window
    window.open(`/dashboard/lesson/${lessonId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-curare-blue"></div>
      </div>
    )
  }

  // Separate mapped and unmapped lessons
  const mappedLessons = lessons.filter(l => l.is_mapped).sort((a, b) => (a.seq_order || 0) - (b.seq_order || 0))
  const unmappedLessons = lessons.filter(l => !l.is_mapped)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Classroom Lessons</h2>
        <p className="text-sm text-gray-600">
          Drag to reorder mapped lessons. Click to lock/unlock or mark as mandatory.
        </p>
      </div>

      {/* Mapped Lessons (in sequence) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Classroom Sequence</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="mapped-lessons">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {mappedLessons.map((lesson, index) => (
                  <Draggable key={lesson.id} draggableId={lesson.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-gray-50 rounded-lg p-4 border-2 ${
                          snapshot.isDragging ? 'border-curare-blue shadow-lg' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-move text-gray-400 hover:text-gray-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
                                  {lesson.path_type}
                                </span>
                                {lesson.mandatory && (
                                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                    Mandatory
                                  </span>
                                )}
                                {lesson.locked && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                    Locked
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Sequence: {lesson.seq_order} • Duration: {lesson.duration_minutes || 'N/A'} min
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleLock(lesson)}
                              className={`px-3 py-1 text-sm rounded ${
                                lesson.locked
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                              disabled={saving}
                            >
                              {lesson.locked ? '🔒 Locked' : '🔓 Unlocked'}
                            </button>
                            <button
                              onClick={() => toggleMandatory(lesson)}
                              className={`px-3 py-1 text-sm rounded ${
                                lesson.mandatory
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              disabled={saving}
                            >
                              {lesson.mandatory ? '★ Mandatory' : '○ Optional'}
                            </button>
                            <button
                              onClick={() => previewLesson(lesson.id)}
                              className="px-3 py-1 text-sm bg-curare-blue text-white rounded hover:bg-blue-700"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => removeLessonMapping(lesson.classroom_lesson_id)}
                              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              disabled={saving}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {mappedLessons.length === 0 && (
          <p className="text-gray-500 text-center py-8">No lessons mapped to this classroom yet.</p>
        )}
      </div>

      {/* Available Lessons (not yet mapped) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Lessons</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unmappedLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-curare-blue transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">
                  {lesson.path_type}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Duration: {lesson.duration_minutes || 'N/A'} min
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => createLessonMapping(lesson.id)}
                  className="flex-1 px-3 py-2 text-sm bg-curare-blue text-white rounded hover:bg-blue-700"
                  disabled={saving}
                >
                  Add to Class
                </button>
                <button
                  onClick={() => previewLesson(lesson.id)}
                  className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
        {unmappedLessons.length === 0 && (
          <p className="text-gray-500 text-center py-8">All lessons are mapped to this classroom.</p>
        )}
      </div>
    </div>
  )
}

export default LessonsTab

