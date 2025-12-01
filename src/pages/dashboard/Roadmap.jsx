import { useState, useEffect, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const Roadmap = () => {
  const navigate = useNavigate()
  const { userData } = useOutletContext()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Initialize current path from user data
    if (userData && !currentPath) {
      setCurrentPath(userData.selected_path || 'Pre-Med')
    }
  }, [userData, currentPath])

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!userData || !currentPath) return

      try {
        // Use currentPath state instead of userData.selected_path
        const selectedPath = currentPath
        
        // Fetch lessons from database filtered by path_type
        const { data: lessons, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('path_type', selectedPath)
          .order('order_index', { ascending: true })

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError)
          setModules([])
          setLoading(false)
          return
        }

        if (!lessons || lessons.length === 0) {
          setModules([])
          setLoading(false)
          return
        }

        // Fetch user's lesson progress for lessons in this path only
        const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
        let progressData = []
        
        if (!isTestMode) {
          const lessonIds = lessons.map(l => l.id)
          
          const { data } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, status, score, xp')
            .eq('user_id', userData.id)
            .in('lesson_id', lessonIds)
          
          progressData = data || []
        } else {
          // Test mode: check sessionStorage for progress
          const testProgress = sessionStorage.getItem('test_lesson_progress')
          if (testProgress) {
            try {
              const parsed = JSON.parse(testProgress)
              progressData = parsed.filter(p => lessons.some(l => l.id === p.lesson_id))
            } catch (e) {
              console.error('Error parsing test progress:', e)
            }
          }
        }

        // Create a map of lesson_id -> progress for quick lookup
        const progressMap = new Map()
        if (progressData) {
          progressData.forEach(progress => {
            progressMap.set(progress.lesson_id, progress)
          })
        }

        // Map lessons to include status, score, and XP
        // In test mode: all lessons are available (skip to any lesson)
        // Normal mode: Lessons unlock progressively: first is always available, others unlock after previous is completed
        const lessonsWithStatus = lessons.map((lesson, index) => {
          const progress = progressMap.get(lesson.id)
          let status = 'locked'
          let xp = null
          
          if (progress) {
            // User has progress on this lesson
            status = progress.status
            xp = progress.xp || null
          } else if (isTestMode) {
            // Test mode: all lessons are available for skipping
            status = 'available'
          } else if (index === 0) {
            // First lesson is always available
            status = 'available'
          } else {
            // Check if previous lesson is completed
            const previousLesson = lessons[index - 1]
            const previousProgress = progressMap.get(previousLesson.id)
            if (previousProgress && previousProgress.status === 'completed') {
              status = 'available'
            }
          }

          return {
            id: lesson.id,
            title: lesson.title,
            duration: lesson.estimated_duration || 15,
            competence: lesson.competence_tag || 'anatomy',
            status: status,
            score: progress?.score || null,
            xp: xp
          }
        })

        // Group lessons by module_id if module_id exists, otherwise show as single module
        const groupedByModule = lessonsWithStatus.reduce((acc, lesson, index) => {
          if (!acc['main']) {
            acc['main'] = {
              id: 'main',
              title: `${selectedPath} Course`,
              lessons: []
            }
          }
          acc['main'].lessons.push(lesson)
          return acc
        }, {})

        const modulesArray = Object.values(groupedByModule)
        setModules(modulesArray)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching roadmap:', error)
        setModules([])
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [userData, currentPath])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedLesson && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click is on a lesson item (to allow switching between lessons)
        const lessonItem = event.target.closest('[data-lesson-id]')
        if (!lessonItem) {
          setSelectedLesson(null)
        }
      }
    }

    if (selectedLesson) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedLesson])

  const handlePathSwitch = async (newPath) => {
    if (newPath === currentPath) return
    
    setCurrentPath(newPath)
    try {
      await supabase
        .from('users')
        .update({ selected_path: newPath })
        .eq('id', userData.id)
    } catch (error) {
      console.error('Error updating selected path:', error)
    }
  }

  const getLessonImage = (lesson) => {
    const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
    
    // In test mode: show available icon for all lessons (since they can all be accessed)
    if (isTestMode && lesson.status === 'locked') {
      return '/newselecticon.png'
    }
    
    if (lesson.status === 'locked') {
      return '/cannotdoyet.png'
    }
    
    if (lesson.status === 'completed') {
      // Check XP to determine which image
      if (lesson.xp !== null && lesson.xp < 40) {
        return '/bad.png'
      } else {
        return '/complete.png'
      }
    }
    
    // Available lesson (next one they can start) - use new select icon
    return '/newselecticon.png'
  }

  const canClickLesson = (lesson) => {
    const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
    
    // In test mode: can click any lesson (all are available)
    if (isTestMode) {
      return true
    }
    
    // Normal mode: Can click if: available (next lesson) OR completed with < 40xp (can restart)
    // Cannot click if: locked OR completed with >= 40xp
    if (lesson.status === 'locked') {
      return false
    }
    if (lesson.status === 'completed') {
      // Can only click if XP < 40 (bad score, can restart)
      return lesson.xp !== null && lesson.xp < 40
    }
    // Available lessons can be clicked
    return lesson.status === 'available'
  }

  const handleLessonClick = (lesson) => {
    if (canClickLesson(lesson)) {
      setSelectedLesson(selectedLesson?.id === lesson.id ? null : lesson)
    }
  }

  const handleStartLesson = () => {
    if (selectedLesson) {
      navigate(`/dashboard/lesson/${selectedLesson.id}`)
    }
  }

  const handleTryAgain = () => {
    if (selectedLesson) {
      navigate(`/dashboard/lesson/${selectedLesson.id}`)
    }
  }

  const handleNevermind = () => {
    setSelectedLesson(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roadmap...</p>
        </div>
      </div>
    )
  }

  const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-6xl space-y-8 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Roadmap</h1>
            <p className="text-gray-600">
              {isTestMode 
                ? 'Test Mode: Skip to any lesson you want' 
                : 'Track your progress through all modules and lessons'
              }
            </p>
          </div>
          
          {/* Path Switcher */}
          <div className="flex items-center space-x-4">
            {isTestMode && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                TEST MODE
              </span>
            )}
            <span className="text-sm font-medium text-gray-700">Switch Path:</span>
            <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
              <button
                onClick={() => handlePathSwitch('Pre-Med')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  currentPath === 'Pre-Med'
                    ? 'bg-curare-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Pre-Med
              </button>
              <button
                onClick={() => handlePathSwitch('Med')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  currentPath === 'Med'
                    ? 'bg-curare-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Med
              </button>
            </div>
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600 mb-4">No lessons available yet. Content will be loaded from the database.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {modules.map((module, moduleIndex) => (
            <div key={module.id} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{module.title}</h2>
              
              <div className="space-y-4 w-full flex flex-col items-center">
                {module.lessons.map((lesson, lessonIndex) => {
                  const imageSrc = getLessonImage(lesson)
                  const isClickable = canClickLesson(lesson)
                  const isSelected = selectedLesson?.id === lesson.id
                  const isBadScore = lesson.status === 'completed' && lesson.xp !== null && lesson.xp < 40
                  
                  return (
                    <motion.div
                      key={lesson.id}
                      className="relative w-full max-w-2xl"
                      data-lesson-id={lesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.5, delay: lessonIndex * 0.1 }}
                    >
                      <div
                        onClick={() => handleLessonClick(lesson)}
                        className={`flex items-center gap-6 w-full ${
                          isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                        }`}
                      >
                        {/* Lesson Icon/Image - Double size, always same (no opacity change for locked) */}
                        <div 
                          className="flex-shrink-0 flex items-center justify-center" 
                          style={{ width: '120px', height: '120px' }}
                        >
                          <img 
                            src={imageSrc} 
                            alt={lesson.status}
                            className="w-full h-full object-contain object-center"
                          />
                        </div>
                        
                        {/* Lesson Title - Right side, vertically centered with icon, grey if locked (but not in test mode) */}
                        <div 
                          className="flex-1 flex items-center h-[120px]"
                        >
                          <h3 className={`text-base font-medium ${
                            lesson.status === 'locked' && !isTestMode ? 'text-gray-400' : 'text-gray-900'
                          }`} style={{ lineHeight: '1.2' }}>
                            {lesson.title}
                          </h3>
                        </div>
                      </div>

                      {/* Dropdown for selected lesson with smooth animation */}
                      <AnimatePresence>
                        {isSelected && isClickable && (
                          <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="mt-2 ml-32 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 z-10" 
                            style={{ width: '300px', position: 'absolute' }}
                          >
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-900 mb-1 text-sm">{lesson.title}</h4>
                              {isBadScore && (
                                <p className="text-xs text-gray-600">You scored less than 40 XP. Try again to improve!</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              {isBadScore ? (
                                <button
                                  onClick={handleTryAgain}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Try Again
                                </button>
                              ) : (
                                <button
                                  onClick={handleStartLesson}
                                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Start Learning
                                </button>
                              )}
                              <button
                                onClick={handleNevermind}
                                className="w-full px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                              >
                                Nevermind
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Roadmap
