import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../services/supabaseService'
import ButtonTemplate from '../../components/ButtonTemplate'
import { trackLessonDropOff, startSessionTracking, stopSessionTracking, trackRetention } from '../../utils/analyticsTracker'
import { addCompletedLesson } from '../../services/progressService'

const LessonPlayer = () => {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Check if this is practice mode (not personalized practice) or review
  const isPracticeMode = location.pathname.includes('/practice') && !location.pathname.includes('/practice/')
  const isReviewMode = location.pathname.includes('/review')
  const [lesson, setLesson] = useState(null)
  const [currentStep, setCurrentStep] = useState(0) // 0: content, 1: task, 2: follow-up, 3: quiz
  const [startTime, setStartTime] = useState(null)
  const [taskAnswers, setTaskAnswers] = useState({})
  const [followUpAnswers, setFollowUpAnswers] = useState({})
  const [quizAnswers, setQuizAnswers] = useState({})
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(0)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizScore, setQuizScore] = useState(null)
  const [dragDropOrder, setDragDropOrder] = useState({}) // For drag and drop questions
  const [textAnswerEvaluations, setTextAnswerEvaluations] = useState({}) // Store evaluation results for text answers
  const [textAnswerAttempts, setTextAnswerAttempts] = useState({}) // Track retry attempts for text answers
  const [showAdminPanel, setShowAdminPanel] = useState(false) // Admin panel visibility
  const [taskAttempts, setTaskAttempts] = useState({}) // Track attempts for tasks (key: taskIndex, value: attempt count)
  const [followUpAttempts, setFollowUpAttempts] = useState({}) // Track attempts for follow-ups (key: followUpIndex, value: attempt count)
  const [taskCorrectness, setTaskCorrectness] = useState({}) // Track if task was answered correctly (key: taskIndex, value: boolean)
  const [followUpCorrectness, setFollowUpCorrectness] = useState({}) // Track if follow-up was answered correctly (key: followUpIndex, value: boolean)
  const [quizAttempted, setQuizAttempted] = useState({}) // Track if quiz question was attempted (key: quizIndex, value: boolean)
  const [showRestartPrompt, setShowRestartPrompt] = useState(false) // Show restart prompt if score < 40
  const [showContentDropdown, setShowContentDropdown] = useState({}) // Track which content dropdowns are open
  // New question type states
  const [mixMatchState, setMixMatchState] = useState({}) // { questionKey: { selectedLeft, selectedRight, matchedPairs, attempts, warnedPairs, isSubmitted } }
  const [progressionTimelineState, setProgressionTimelineState] = useState({}) // { questionKey: { timelineSlots, draggedItem, hoveredSlot, isSubmitted, attempts, slotStates } }
  const [xpEarnedThisSession, setXpEarnedThisSession] = useState(0) // Track XP earned in current lesson session

  const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'

  useEffect(() => {
    // Start session tracking
    startSessionTracking()
    // Track retention (daily visit)
    trackRetention()
    
    return () => {
      // Stop session tracking on unmount
      stopSessionTracking()
    }
  }, [])

  // Track drop-off when component unmounts without completion
  useEffect(() => {
    return () => {
      // On unmount, if lesson wasn't completed, track drop-off and revoke XP
      if (lesson && startTime && currentStep < 3 && !isPracticeMode && !isReviewMode) {
        const stepNames = ['content', 'task', 'follow-up', 'quiz']
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        trackLessonDropOff(lesson.id, stepNames[currentStep] || 'unknown', timeSpent)
        
        // Revoke XP earned in this session if lesson wasn't completed
        if (xpEarnedThisSession > 0) {
          const today = new Date().toDateString()
          import('../../services/progressService').then(({ subtractDailyXP }) => {
            subtractDailyXP(today, xpEarnedThisSession).then(() => {
              window.dispatchEvent(new CustomEvent('tsv2XPGained', { detail: { xp: -xpEarnedThisSession } }))
            })
          })
        }
      }
    }
  }, [lesson, startTime, currentStep, isPracticeMode, isReviewMode, xpEarnedThisSession])

  useEffect(() => {
    const fetchLesson = async () => {
      // Track lesson start
      setStartTime(Date.now())
      
      try {
        // Fetch lesson from database
        const { data: lessonData, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single()

        if (error) {
          return
        }

        if (lessonData) {
          const content = lessonData.content || {}
          
          const tasks = Array.isArray(content.tasks) ? content.tasks : (Array.isArray(content.task) ? content.task : [])
          const followUps = Array.isArray(content.followUps) ? content.followUps : (Array.isArray(content.follow_ups) ? content.follow_ups : (Array.isArray(content.followups) ? content.followups : []))
          const quizData = content.quiz || {}
          const quizQuestions = Array.isArray(quizData.questions) ? quizData.questions : []
          
          setLesson({
            id: lessonData.id,
            title: lessonData.title,
            objective: lessonData.objective,
            estimatedDuration: lessonData.estimated_duration,
            content: {
              text: content.text || '',
              tasks: tasks,
              followUps: followUps,
              quiz: { questions: quizQuestions }
            }
          })
        }
      } catch (error) {
        // Silent fail
      }
    }

    fetchLesson()
  }, [lessonId])

  // Calculate XP for tasks
  const calculateTaskXP = (taskIndex) => {
    const attempts = taskAttempts[taskIndex] || 0
    const isCorrect = taskCorrectness[taskIndex] || false
    
    if (!isCorrect && attempts >= 3) return 0 // Everything wrong
    if (attempts === 1) return 10 // First try
    if (attempts === 2) return 8 // Second try
    if (attempts === 3) return 5 // Third try
    return 0
  }

  // Calculate XP for follow-ups
  const calculateFollowUpXP = (followUpIndex) => {
    const attempts = followUpAttempts[followUpIndex] || 0
    const isCorrect = followUpCorrectness[followUpIndex] || false
    
    if (!isCorrect) return 0 // Fail
    if (attempts === 1) return 5 // First try
    if (attempts === 2 || attempts === 3) return 3 // 2nd/3rd try
    return 0
  }

  // Calculate XP for quiz
  const calculateQuizXP = (quizIndex) => {
    // Only one attempt allowed - first try gets 20 XP, anything else gets 0
    // This is handled by preventing multiple attempts
    return 20 // If they answered, it's their first (and only) attempt
  }

  // Calculate total XP
  const calculateTotalXP = () => {
    let totalXP = 0
    
    // Task XP
    if (lesson?.content?.tasks) {
      lesson.content.tasks.forEach((_, index) => {
        totalXP += calculateTaskXP(index)
      })
    }
    
    // Follow-up XP
    if (lesson?.content?.followUps) {
      lesson.content.followUps.forEach((_, index) => {
        totalXP += calculateFollowUpXP(index)
      })
    }
    
    // Quiz XP
    if (lesson?.content?.quiz?.questions) {
      lesson.content.quiz.questions.forEach((_, index) => {
        if (quizAttempted[index]) {
          // Check if answer is correct
          const question = lesson.content.quiz.questions[index]
          let isCorrect = false
          
          if (question.type === 'drag_drop') {
            const userOrder = dragDropOrder[index] || []
            const correctOrder = question.correct_order || []
            const items = question.items || []
            const correctItemsOrder = correctOrder.map(idx => items[idx])
            isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
          } else if (question.type === 'text_answer') {
            const evaluation = textAnswerEvaluations[index]
            isCorrect = evaluation?.isCorrect === true
          } else if (question.type === 'fill_in_blank') {
            const userAnswer = quizAnswers[index] || ''
            const correctAnswer = question.correct_answer || ''
            isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
          } else {
            isCorrect = quizAnswers[index] === question.correct
          }
          
          if (isCorrect) {
            totalXP += calculateQuizXP(index)
          }
        }
      })
    }
    
    return totalXP
  }

  const handleComplete = async (score = null) => {
    const timeSpent = Math.round((Date.now() - startTime) / 60000) // minutes
    const finalScore = score !== null ? score : (quizScore || 0)
    
    // Calculate total XP from correct answers
    const correctAnswersXP = calculateTotalXP()
    
    // If XP < 40, show restart prompt
    if (correctAnswersXP < 40) {
      setShowRestartPrompt(true)
      return
    }
    
    // Add 5 XP bonus on completion
    const completionBonus = 5
    const finalXP = correctAnswersXP + completionBonus
    const totalXPEarned = finalXP
    
    // Track XP earned in this session (for potential revocation if quit early)
    setXpEarnedThisSession(totalXPEarned)
    
    // Dispatch XP events
    // Note: XP from correct questions should be dispatched per question, but for now we dispatch total
    if (correctAnswersXP > 0) {
      window.dispatchEvent(new CustomEvent('tsv2XPGained', { detail: { xp: correctAnswersXP } }))
    }
    window.dispatchEvent(new CustomEvent('tsv2XPGained', { detail: { xp: completionBonus } }))
    
    // In test mode, save to sessionStorage for unlocking
    if (isTestMode && lesson) {
      const testProgress = JSON.parse(sessionStorage.getItem('test_lesson_progress') || '[]')
      const existingIndex = testProgress.findIndex(p => p.lesson_id === lesson.id)
      const progressEntry = {
        lesson_id: lesson.id,
        status: 'completed',
        score: finalScore,
        xp: finalXP,
        time_spent_minutes: timeSpent,
        completed_at: new Date().toISOString(),
      }
      
      if (existingIndex >= 0) {
        testProgress[existingIndex] = progressEntry
      } else {
        testProgress.push(progressEntry)
      }
      
      // Only mark as completed and dispatch event if NOT practice mode or review mode
      if (!isPracticeMode && !isReviewMode) {
        try {
          await addCompletedLesson(lesson.id)
        } catch (error) {
          console.error('[LessonPlayer] Test mode: Error saving lesson completion:', error)
        }
        window.dispatchEvent(new Event('tsv2LessonCompleted'))
      }
      
      // Update test user XP in sessionStorage
      const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
      testUserData.xp = (testUserData.xp || 0) + finalXP
      testUserData.level = Math.floor((testUserData.xp || 0) / 100) + 1
      sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
      
      sessionStorage.setItem('test_lesson_progress', JSON.stringify(testProgress))
      navigate('/testsecurev2')
      // Dispatch event after navigation for test mode
      setTimeout(() => {
        window.dispatchEvent(new Event('tsv2LessonCompleted'))
      }, 200)
      return
    }
    
    // Only mark as completed and dispatch event if NOT practice mode or review mode
    if (!isPracticeMode && !isReviewMode) {
      try {
        if (lesson) {
          await addCompletedLesson(lesson.id)
          // Dispatch event AFTER saving to ensure data is persisted
          window.dispatchEvent(new Event('tsv2LessonCompleted'))
        }
      } catch (error) {
        console.error('[LessonPlayer] Non-test mode: Error saving lesson completion:', error)
      }
    } else {
      // Track drop-off for practice/review modes if not completed
      if (lesson && startTime && currentStep < 3) {
        const stepNames = ['content', 'task', 'follow-up', 'quiz']
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        trackLessonDropOff(lesson.id, stepNames[currentStep] || 'practice_or_review', timeSpent)
      }
      navigate('/testsecurev2')
    }
  }

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {/* Admin Panel (only for testsecure users) */}
        {isTestMode && (
          <div className="mb-6 border-2 border-yellow-400 rounded-lg bg-yellow-50 p-4">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="w-full flex items-center justify-between text-left font-semibold text-yellow-900"
            >
              <span>🔧 Admin Controls</span>
              <span>{showAdminPanel ? '▼' : '▶'}</span>
            </button>
            
            {showAdminPanel && (
              <div className="mt-4 space-y-4">
                {/* Step Selector */}
                <div>
                  <label className="block text-sm font-medium text-yellow-900 mb-2">
                    Jump to Step:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Content', 'Task', 'Follow-up', 'Quiz'].map((stepName, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentStep(idx)
                          if (idx === 1) setCurrentTaskIndex(0)
                          if (idx === 2) setCurrentFollowUpIndex(0)
                          if (idx === 3) setCurrentQuizIndex(0)
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentStep === idx
                            ? 'bg-yellow-600 text-white'
                            : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                        }`}
                      >
                        {stepName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Task Question Selector */}
                {currentStep === 1 && lesson.content.tasks && lesson.content.tasks.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 mb-2">
                      Jump to Task Question:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {lesson.content.tasks.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentTaskIndex(idx)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentTaskIndex === idx
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                          }`}
                        >
                          Task {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Question Selector */}
                {currentStep === 2 && lesson.content.followUps && lesson.content.followUps.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 mb-2">
                      Jump to Follow-up Question:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {lesson.content.followUps.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentFollowUpIndex(idx)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentFollowUpIndex === idx
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                          }`}
                        >
                          Follow-up {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Question Selector */}
                {currentStep === 3 && lesson.content.quiz?.questions && lesson.content.quiz.questions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-yellow-900 mb-2">
                      Jump to Quiz Question:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {lesson.content.quiz.questions.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentQuizIndex(idx)}
                          className={`px-3 py-1 rounded-md text-sm font-medium ${
                            currentQuizIndex === idx
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300'
                          }`}
                        >
                          Quiz {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => {
              // Track drop-off if lesson not completed
              if (lesson && currentStep < 3) {
                const stepNames = ['content', 'task', 'follow-up', 'quiz']
                const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0
                trackLessonDropOff(lesson.id, stepNames[currentStep], timeSpent)
              }
              navigate('/testsecurev2')
            }}
            className="text-sm text-gray-600 hover:text-curare-blue mb-4"
          >
            ← Back to Roadmap
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <p className="text-gray-600 mb-4">{lesson.objective}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>⏱️ {lesson.estimatedDuration} min</span>
            <span>•</span>
            <span>Step {currentStep + 1} of 4</span>
          </div>
        </div>

        {/* Content Steps */}
        {currentStep === 0 && (
          <div className="space-y-4">
            {lesson.content.video ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video Player Placeholder</p>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {lesson.content?.text ? (
                    lesson.content.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <p>Loading lesson content...</p>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6">
              <ButtonTemplate
                variant="button1"
                text="Continue to Task"
                textColor="white"
                onClick={() => setCurrentStep(1)}
                className="w-auto"
                style={{ width: '200px', height: 'auto' }}
              />
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Interactive Task {currentTaskIndex + 1} of {lesson.content.tasks?.length || 1}</h2>
            
            {/* Developer Auto-Mark Buttons (hidden) */}
            {false && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">🔧 Developer Tools:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const task = lesson.content.tasks[currentTaskIndex]
                      if (!task) return
                      const taskKey = `task-${currentTaskIndex}`
                      
                      if (task.questionFormat === 'multiple_choice') {
                        setTaskAnswers({ ...taskAnswers, [currentTaskIndex]: task.correct })
                      } else if (task.questionFormat === 'drag_drop') {
                        const items = task.items || []
                        const correctOrder = task.correct_order || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        setDragDropOrder({ ...dragDropOrder, [taskKey]: correctItemsOrder })
                      } else if (task.questionFormat === 'text_answer') {
                        const feedback = generateFeedback(task.question, 'Correct answer', true)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [taskKey]: { isCorrect: true, answer: 'Correct answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [taskKey]: { count: 1, wrongAnswers: [] }
                        })
                      }
                      
                      // Track as correct
                      setTaskCorrectness({ ...taskCorrectness, [currentTaskIndex]: true })
                      setTaskAttempts({ ...taskAttempts, [currentTaskIndex]: 1 })
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Mark Correct
                  </button>
                  <button
                    onClick={() => {
                      const task = lesson.content.tasks[currentTaskIndex]
                      if (!task) return
                      const taskKey = `task-${currentTaskIndex}`
                      
                      if (task.questionFormat === 'multiple_choice') {
                        const wrongIndex = task.correct === 0 ? 1 : 0
                        setTaskAnswers({ ...taskAnswers, [currentTaskIndex]: wrongIndex })
                      } else if (task.questionFormat === 'drag_drop') {
                        const items = task.items || []
                        const wrongOrder = [...items].reverse()
                        setDragDropOrder({ ...dragDropOrder, [taskKey]: wrongOrder })
                      } else if (task.questionFormat === 'text_answer') {
                        const feedback = generateFeedback(task.question, 'Wrong answer', false)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [taskKey]: { isCorrect: false, answer: 'Wrong answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [taskKey]: { count: 1, wrongAnswers: [{ answer: 'Wrong answer', feedback }] }
                        })
                      }
                      
                      // Track as wrong
                      setTaskCorrectness({ ...taskCorrectness, [currentTaskIndex]: false })
                      setTaskAttempts({ ...taskAttempts, [currentTaskIndex]: 1 })
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    ✗ Mark Wrong
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">{lesson.content.tasks[currentTaskIndex]?.question}</p>
              {lesson.content.tasks[currentTaskIndex]?.hint && (
                <p className="text-sm text-gray-500 mb-4">💡 Hint: {lesson.content.tasks[currentTaskIndex].hint}</p>
              )}
              {renderQuestionByType(
                {
                  ...lesson.content.tasks[currentTaskIndex],
                  type: lesson.content.tasks[currentTaskIndex]?.questionFormat || 'text_answer'
                },
                `task-${currentTaskIndex}`,
                taskAnswers,
                setTaskAnswers,
                dragDropOrder,
                setDragDropOrder,
                textAnswerEvaluations,
                setTextAnswerEvaluations,
                textAnswerAttempts,
                setTextAnswerAttempts,
                false, // isQuiz
                false, // isAttempted
                mixMatchState,
                setMixMatchState,
                progressionTimelineState,
                setProgressionTimelineState
              )}
            </div>
            <div className="flex justify-between">
              {currentTaskIndex > 0 && (
                <button
                  onClick={() => setCurrentTaskIndex(currentTaskIndex - 1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              <div className="ml-auto">
                {currentTaskIndex < (lesson.content.tasks?.length || 1) - 1 ? (
                  <button
                    onClick={() => {
                      const task = lesson.content.tasks[currentTaskIndex]
                      const taskFormat = task?.questionFormat || 'text_answer'
                      const taskKey = `task-${currentTaskIndex}`
                      const isAnswered = taskFormat === 'drag_drop' 
                        ? dragDropOrder[taskKey] && dragDropOrder[taskKey].length > 0
                        : taskFormat === 'text_answer' || taskFormat === 'fill_in_blank'
                        ? textAnswerEvaluations[taskKey] !== undefined || taskAnswers[currentTaskIndex] !== undefined
                        : taskAnswers[currentTaskIndex] !== undefined
                      
                      if (!isAnswered) {
                        alert('Please answer the question to continue')
                        return
                      }
                      
                      // Track attempt and correctness for XP calculation
                      const currentAttempts = taskAttempts[currentTaskIndex] || 0
                      setTaskAttempts({ ...taskAttempts, [currentTaskIndex]: currentAttempts + 1 })
                      
                      // Determine if answer is correct
                      let isCorrect = false
                      if (taskFormat === 'drag_drop') {
                        const userOrder = dragDropOrder[taskKey] || []
                        const correctOrder = task.correct_order || []
                        const items = task.items || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
                      } else if (taskFormat === 'text_answer') {
                        const evaluation = textAnswerEvaluations[taskKey]
                        isCorrect = evaluation?.isCorrect === true
                      } else if (taskFormat === 'fill_in_blank') {
                        const userAnswer = taskAnswers[currentTaskIndex] || ''
                        const correctAnswer = task.correct_answer || ''
                        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
                      } else {
                        isCorrect = taskAnswers[currentTaskIndex] === task.correct
                      }
                      setTaskCorrectness({ ...taskCorrectness, [currentTaskIndex]: isCorrect })
                      
                      setCurrentTaskIndex(currentTaskIndex + 1)
                    }}
                    className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Task
                  </button>
                ) : (
                  <ButtonTemplate
                    variant="button2"
                    text="Continue to Follow-Up"
                    textColor="#2563ebff"
                    onClick={() => {
                      const task = lesson.content.tasks[currentTaskIndex]
                      const taskFormat = task?.questionFormat || 'text_answer'
                      const taskKey = `task-${currentTaskIndex}`
                      const isAnswered = taskFormat === 'drag_drop' 
                        ? dragDropOrder[taskKey] && dragDropOrder[taskKey].length > 0
                        : taskFormat === 'text_answer' || taskFormat === 'fill_in_blank'
                        ? textAnswerEvaluations[taskKey] !== undefined || taskAnswers[currentTaskIndex] !== undefined
                        : taskAnswers[currentTaskIndex] !== undefined
                      
                      if (!isAnswered) {
                        alert('Please answer the question to continue')
                        return
                      }
                      
                      // Track attempt and correctness for XP calculation
                      const currentAttempts = taskAttempts[currentTaskIndex] || 0
                      setTaskAttempts({ ...taskAttempts, [currentTaskIndex]: currentAttempts + 1 })
                      
                      // Determine if answer is correct
                      let isCorrect = false
                      if (taskFormat === 'drag_drop') {
                        const userOrder = dragDropOrder[taskKey] || []
                        const correctOrder = task.correct_order || []
                        const items = task.items || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
                      } else if (taskFormat === 'text_answer') {
                        const evaluation = textAnswerEvaluations[taskKey]
                        isCorrect = evaluation?.isCorrect === true
                      } else if (taskFormat === 'fill_in_blank') {
                        const userAnswer = taskAnswers[currentTaskIndex] || ''
                        const correctAnswer = task.correct_answer || ''
                        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
                      } else {
                        isCorrect = taskAnswers[currentTaskIndex] === task.correct
                      }
                      setTaskCorrectness({ ...taskCorrectness, [currentTaskIndex]: isCorrect })
                      
                      setCurrentStep(2)
                    }}
                    className="w-auto"
                    style={{ width: '220px', height: 'auto' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Adaptive Follow-up {currentFollowUpIndex + 1} of {lesson.content.followUps?.length || 1}</h2>
            
            {/* Developer Auto-Mark Buttons (hidden) */}
            {false && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">🔧 Developer Tools:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const followup = lesson.content.followUps[currentFollowUpIndex]
                      if (!followup) return
                      const followupKey = `followup-${currentFollowUpIndex}`
                      
                      if (followup.questionFormat === 'multiple_choice') {
                        setFollowUpAnswers({ ...followUpAnswers, [currentFollowUpIndex]: followup.correct })
                      } else if (followup.questionFormat === 'drag_drop') {
                        const items = followup.items || []
                        const correctOrder = followup.correct_order || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        setDragDropOrder({ ...dragDropOrder, [followupKey]: correctItemsOrder })
                      } else if (followup.questionFormat === 'text_answer') {
                        const feedback = generateFeedback(followup.question, 'Correct answer', true)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [followupKey]: { isCorrect: true, answer: 'Correct answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [followupKey]: { count: 1, wrongAnswers: [] }
                        })
                      }
                      
                      // Track as correct
                      setFollowUpCorrectness({ ...followUpCorrectness, [currentFollowUpIndex]: true })
                      setFollowUpAttempts({ ...followUpAttempts, [currentFollowUpIndex]: 1 })
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Mark Correct
                  </button>
                  <button
                    onClick={() => {
                      const followup = lesson.content.followUps[currentFollowUpIndex]
                      if (!followup) return
                      const followupKey = `followup-${currentFollowUpIndex}`
                      
                      if (followup.questionFormat === 'multiple_choice') {
                        const wrongIndex = followup.correct === 0 ? 1 : 0
                        setFollowUpAnswers({ ...followUpAnswers, [currentFollowUpIndex]: wrongIndex })
                      } else if (followup.questionFormat === 'drag_drop') {
                        const items = followup.items || []
                        const wrongOrder = [...items].reverse()
                        setDragDropOrder({ ...dragDropOrder, [followupKey]: wrongOrder })
                      } else if (followup.questionFormat === 'text_answer') {
                        const feedback = generateFeedback(followup.question, 'Wrong answer', false)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [followupKey]: { isCorrect: false, answer: 'Wrong answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [followupKey]: { count: 1, wrongAnswers: [{ answer: 'Wrong answer', feedback }] }
                        })
                      }
                      
                      // Track as wrong
                      setFollowUpCorrectness({ ...followUpCorrectness, [currentFollowUpIndex]: false })
                      setFollowUpAttempts({ ...followUpAttempts, [currentFollowUpIndex]: 1 })
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    ✗ Mark Wrong
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">{lesson.content.followUps[currentFollowUpIndex]?.question}</p>
              {renderQuestionByType(
                {
                  ...lesson.content.followUps[currentFollowUpIndex],
                  type: lesson.content.followUps[currentFollowUpIndex]?.questionFormat || 'text_answer'
                },
                `followup-${currentFollowUpIndex}`,
                followUpAnswers,
                setFollowUpAnswers,
                dragDropOrder,
                setDragDropOrder,
                textAnswerEvaluations,
                setTextAnswerEvaluations,
                textAnswerAttempts,
                setTextAnswerAttempts,
                false, // isQuiz
                false, // isAttempted
                mixMatchState,
                setMixMatchState,
                progressionTimelineState,
                setProgressionTimelineState
              )}
              {followUpAnswers[currentFollowUpIndex] && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{lesson.content.followUps[currentFollowUpIndex]?.feedback}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              {currentFollowUpIndex > 0 && (
                <button
                  onClick={() => setCurrentFollowUpIndex(currentFollowUpIndex - 1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              <div className="ml-auto">
                {currentFollowUpIndex < (lesson.content.followUps?.length || 1) - 1 ? (
                  <button
                    onClick={async () => {
                      const followup = lesson.content.followUps[currentFollowUpIndex]
                      const followupFormat = followup?.questionFormat || 'text_answer'
                      const followupKey = `followup-${currentFollowUpIndex}`
                      const isAnswered = followupFormat === 'drag_drop'
                        ? dragDropOrder[followupKey] && dragDropOrder[followupKey].length > 0
                        : followupFormat === 'text_answer' || followupFormat === 'fill_in_blank'
                        ? textAnswerEvaluations[followupKey] !== undefined || followUpAnswers[currentFollowUpIndex] !== undefined
                        : followUpAnswers[currentFollowUpIndex] !== undefined
                      
                      if (!isAnswered) {
                        alert('Please answer the question to continue')
                        return
                      }
                      
                      // Track attempt and correctness for XP calculation
                      const currentAttempts = followUpAttempts[currentFollowUpIndex] || 0
                      setFollowUpAttempts({ ...followUpAttempts, [currentFollowUpIndex]: currentAttempts + 1 })
                      
                      // Determine if answer is correct
                      let isCorrect = false
                      if (followupFormat === 'drag_drop') {
                        const userOrder = dragDropOrder[followupKey] || []
                        const correctOrder = followup.correct_order || []
                        const items = followup.items || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
                      } else if (followupFormat === 'text_answer') {
                        const evaluation = textAnswerEvaluations[followupKey]
                        isCorrect = evaluation?.isCorrect === true
                      } else if (followupFormat === 'fill_in_blank') {
                        const userAnswer = followUpAnswers[currentFollowUpIndex] || ''
                        const correctAnswer = followup.correct_answer || ''
                        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
                      } else {
                        isCorrect = followUpAnswers[currentFollowUpIndex] === followup.correct
                      }
                      setFollowUpCorrectness({ ...followUpCorrectness, [currentFollowUpIndex]: isCorrect })
                      
                      // Track adaptive follow-up (skip in test mode)
                      if (!isTestMode) {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session) {
                          await supabase.from('analytics').insert({
                            user_id: session.user.id,
                            event_type: 'adaptive_followup_taken',
                            lesson_id: lesson.id,
                            metadata: {
                              followup_id: lesson.content.followUps[currentFollowUpIndex]?.id,
                              answer: followUpAnswers[currentFollowUpIndex] || dragDropOrder[followupKey]
                            }
                          })
                        }
                      }
                      
                      setCurrentFollowUpIndex(currentFollowUpIndex + 1)
                    }}
                    className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Question
                  </button>
                ) : (
                  <ButtonTemplate
                    variant="button2"
                    text="Continue to Quiz"
                    textColor="#2563ebff"
                    onClick={async () => {
                      const followup = lesson.content.followUps[currentFollowUpIndex]
                      const followupFormat = followup?.questionFormat || 'text_answer'
                      const followupKey = `followup-${currentFollowUpIndex}`
                      const isAnswered = followupFormat === 'drag_drop'
                        ? dragDropOrder[followupKey] && dragDropOrder[followupKey].length > 0
                        : followupFormat === 'text_answer' || followupFormat === 'fill_in_blank'
                        ? textAnswerEvaluations[followupKey] !== undefined || followUpAnswers[currentFollowUpIndex] !== undefined
                        : followUpAnswers[currentFollowUpIndex] !== undefined
                      
                      if (!isAnswered) {
                        alert('Please answer the question to continue')
                        return
                      }
                      
                      // Track attempt and correctness for XP calculation
                      const currentAttempts = followUpAttempts[currentFollowUpIndex] || 0
                      setFollowUpAttempts({ ...followUpAttempts, [currentFollowUpIndex]: currentAttempts + 1 })
                      
                      // Determine if answer is correct
                      let isCorrect = false
                      if (followupFormat === 'drag_drop') {
                        const userOrder = dragDropOrder[followupKey] || []
                        const correctOrder = followup.correct_order || []
                        const items = followup.items || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
                      } else if (followupFormat === 'text_answer') {
                        const evaluation = textAnswerEvaluations[followupKey]
                        isCorrect = evaluation?.isCorrect === true
                      } else if (followupFormat === 'fill_in_blank') {
                        const userAnswer = followUpAnswers[currentFollowUpIndex] || ''
                        const correctAnswer = followup.correct_answer || ''
                        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()
                      } else {
                        isCorrect = followUpAnswers[currentFollowUpIndex] === followup.correct
                      }
                      setFollowUpCorrectness({ ...followUpCorrectness, [currentFollowUpIndex]: isCorrect })
                      
                      // Track adaptive follow-up (skip in test mode)
                      if (!isTestMode) {
                        const { data: { session } } = await supabase.auth.getSession()
                        if (session) {
                          await supabase.from('analytics').insert({
                            user_id: session.user.id,
                            event_type: 'adaptive_followup_taken',
                            lesson_id: lesson.id,
                            metadata: {
                              followup_id: lesson.content.followUps[currentFollowUpIndex]?.id,
                              answer: followUpAnswers[currentFollowUpIndex] || dragDropOrder[followupKey]
                            }
                          })
                        }
                      }
                      
                      setCurrentStep(3)
                    }}
                    className="w-auto"
                    style={{ width: '220px', height: 'auto' }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quiz {currentQuizIndex + 1} of {lesson.content.quiz?.questions?.length || 1}</h2>
            
            {/* Developer Auto-Mark Buttons (hidden) */}
            {false && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">🔧 Developer Tools:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const question = lesson.content.quiz?.questions[currentQuizIndex]
                      if (!question) return
                      
                      // Auto-mark as correct
                      if (question.type === 'multiple_choice') {
                        setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: question.correct })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      } else if (question.type === 'drag_drop') {
                        const items = question.items || []
                        const correctOrder = question.correct_order || []
                        const correctItemsOrder = correctOrder.map(idx => items[idx])
                        setDragDropOrder({ ...dragDropOrder, [currentQuizIndex]: correctItemsOrder })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      } else if (question.type === 'text_answer') {
                        const feedback = generateFeedback(question.question, 'Correct answer', true)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [currentQuizIndex]: { isCorrect: true, answer: 'Correct answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [currentQuizIndex]: { count: 1, wrongAnswers: [] }
                        })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      }
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    ✓ Mark Correct
                  </button>
                  <button
                    onClick={() => {
                      const question = lesson.content.quiz?.questions[currentQuizIndex]
                      if (!question) return
                      
                      // Auto-mark as wrong
                      if (question.type === 'multiple_choice') {
                        // Set to wrong answer (not the correct one)
                        const wrongIndex = question.correct === 0 ? 1 : 0
                        setQuizAnswers({ ...quizAnswers, [currentQuizIndex]: wrongIndex })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      } else if (question.type === 'drag_drop') {
                        const items = question.items || []
                        // Set to wrong order (reversed)
                        const wrongOrder = [...items].reverse()
                        setDragDropOrder({ ...dragDropOrder, [currentQuizIndex]: wrongOrder })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      } else if (question.type === 'text_answer') {
                        const feedback = generateFeedback(question.question, 'Wrong answer', false)
                        setTextAnswerEvaluations({
                          ...textAnswerEvaluations,
                          [currentQuizIndex]: { isCorrect: false, answer: 'Wrong answer', feedback }
                        })
                        setTextAnswerAttempts({
                          ...textAnswerAttempts,
                          [currentQuizIndex]: { count: 1, wrongAnswers: [{ answer: 'Wrong answer', feedback }] }
                        })
                        if (!quizAttempted[currentQuizIndex]) {
                          setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                        }
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    ✗ Mark Wrong
                  </button>
                </div>
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">{lesson.content.quiz?.questions[currentQuizIndex]?.question}</p>
              
              {/* Render different question types */}
              {renderQuestionByType(
                lesson.content.quiz?.questions[currentQuizIndex],
                currentQuizIndex,
                quizAnswers,
                (newAnswers) => {
                  // Mark quiz question as attempted when answer is selected
                  if (!quizAttempted[currentQuizIndex]) {
                    setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                  }
                  setQuizAnswers(newAnswers)
                },
                dragDropOrder,
                (newOrder) => {
                  // Mark quiz question as attempted when drag_drop order is submitted
                  if (!quizAttempted[currentQuizIndex]) {
                    setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                  }
                  setDragDropOrder(newOrder)
                },
                textAnswerEvaluations,
                (newEvaluations) => {
                  // Mark quiz question as attempted when text answer is submitted
                  if (!quizAttempted[currentQuizIndex]) {
                    setQuizAttempted({ ...quizAttempted, [currentQuizIndex]: true })
                  }
                  setTextAnswerEvaluations(newEvaluations)
                },
                textAnswerAttempts,
                setTextAnswerAttempts,
                true, // isQuiz - only one attempt allowed
                quizAttempted[currentQuizIndex] || false, // isAttempted
                mixMatchState,
                setMixMatchState,
                progressionTimelineState,
                setProgressionTimelineState
              )}
              
              {quizAnswers[currentQuizIndex] !== undefined && (
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {lesson.content.quiz.questions[currentQuizIndex].explanation}
                    </p>
                  </div>
                  
                  {/* Collapsible Lesson Content Reference */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setShowContentDropdown({
                          ...showContentDropdown,
                          [currentQuizIndex]: !showContentDropdown[currentQuizIndex]
                        })
                      }}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        📖 Review Lesson Content
                      </span>
                      <span className="text-gray-500">
                        {showContentDropdown[currentQuizIndex] ? '▼' : '▶'}
                      </span>
                    </button>
                    {showContentDropdown[currentQuizIndex] && (
                      <div className="p-4 bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
                        <div className="prose max-w-none text-sm text-gray-700">
                          {lesson.content?.text ? (
                            lesson.content.text.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-3">{paragraph}</p>
                            ))
                          ) : (
                            <p className="text-gray-500">No lesson content available.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {quizAttempted[currentQuizIndex] && quizAnswers[currentQuizIndex] === undefined && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ You've already attempted this question. Only one attempt is allowed for quiz questions.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              {currentQuizIndex > 0 && (
                <button
                  onClick={() => setCurrentQuizIndex(currentQuizIndex - 1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Previous
                </button>
              )}
              {isQuestionAnswered(lesson.content.quiz?.questions[currentQuizIndex], currentQuizIndex, quizAnswers, dragDropOrder, textAnswerEvaluations, textAnswerAttempts, true) ? (
                <button
                  onClick={() => {
                    if (currentQuizIndex < (lesson.content.quiz?.questions?.length || 1) - 1) {
                      setCurrentQuizIndex(currentQuizIndex + 1)
                    } else {
                      // Calculate score
                      const total = lesson.content.quiz.questions.length
                      const correct = lesson.content.quiz.questions.filter((q, i) => {
                        if (q.type === 'drag_drop') {
                          const userOrder = dragDropOrder[i] || []
                          const correctOrder = q.correct_order || []
                          const items = q.items || []
                          const correctItemsOrder = correctOrder.map(idx => items[idx])
                          return JSON.stringify(userOrder) === JSON.stringify(correctItemsOrder)
                        } else if (q.type === 'text_answer') {
                          // For text answers, check if correct OR if locked after 3 attempts (count as wrong for scoring)
                          const evaluation = textAnswerEvaluations[i]
                          return evaluation?.isCorrect === true
                        } else {
                          return quizAnswers[i] === q.correct
                        }
                      }).length
                      const score = Math.round((correct / total) * 100)
                      setQuizScore(score)
                      handleComplete(score)
                    }
                  }}
                  className="ml-auto px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {currentQuizIndex < (lesson.content.quiz?.questions?.length || 1) - 1 ? 'Next Question' : 'Complete Lesson'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    alert('Please answer the question to continue')
                  }}
                  className="ml-auto px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                  disabled
                >
                  Answer the question to continue
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-4">
        {/* Quick Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Take your time reading</li>
            <li>• Review key terms</li>
            <li>• Practice with the interactive tasks</li>
          </ul>
        </div>

        {/* Safety Notes */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">⚠️ Safety Notes</h3>
          <p className="text-sm text-gray-700">
            This lesson covers theoretical concepts. Always consult a medical professional for real-world medical situations.
          </p>
        </div>

      </div>

      {/* Restart Prompt Modal */}
      {showRestartPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Low Score Warning</h2>
            <p className="text-gray-700 mb-4">
              Your total XP is {calculateTotalXP()} (less than 40). You may want to restart the lesson to improve your score.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // Restart lesson
                  setCurrentStep(0)
                  setCurrentTaskIndex(0)
                  setCurrentFollowUpIndex(0)
                  setCurrentQuizIndex(0)
                  setTaskAnswers({})
                  setFollowUpAnswers({})
                  setQuizAnswers({})
                  setTaskAttempts({})
                  setFollowUpAttempts({})
                  setTaskCorrectness({})
                  setFollowUpCorrectness({})
                  setQuizAttempted({})
                  setTextAnswerEvaluations({})
                  setTextAnswerAttempts({})
                  setDragDropOrder({})
                  setShowRestartPrompt(false)
                }}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Restart Lesson
              </button>
              <button
                onClick={async () => {
                  // Complete anyway (add 5 XP bonus)
                  const totalXP = calculateTotalXP()
                  const finalXP = totalXP + 5
                  const timeSpent = Math.round((Date.now() - startTime) / 60000)
                  const finalScore = quizScore || 0
                  
                  if (isTestMode && lesson) {
                    const testProgress = JSON.parse(sessionStorage.getItem('test_lesson_progress') || '[]')
                    const existingIndex = testProgress.findIndex(p => p.lesson_id === lesson.id)
                    const progressEntry = {
                      lesson_id: lesson.id,
                      status: 'completed',
                      score: finalScore,
                      time_spent_minutes: timeSpent,
                      completed_at: new Date().toISOString()
                    }
                    
                    if (existingIndex >= 0) {
                      testProgress[existingIndex] = progressEntry
                    } else {
                      testProgress.push(progressEntry)
                    }
                    
                    // Update test user XP
                    const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
                    testUserData.xp = (testUserData.xp || 0) + finalXP
                    testUserData.level = Math.floor((testUserData.xp || 0) / 100) + 1
                    sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
                    
                    sessionStorage.setItem('test_lesson_progress', JSON.stringify(testProgress))
                    setShowRestartPrompt(false)
                    navigate('/testsecurev2')
                    return
                  }
                  
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session && lesson) {
                      await supabase
                        .from('user_progress')
                        .upsert({
                          user_id: session.user.id,
                          lesson_id: lesson.id,
                          completed: true,  // Use completed boolean (table schema)
                          status: 'completed',  // Keep for backward compatibility if column exists
                          score: finalScore,
                          xp: finalXP,
                          time_spent_minutes: timeSpent,
                          completed_at: new Date().toISOString(),
                        })

                      // Time is already logged in user_progress.time_spent_minutes

                      await supabase
                        .from('analytics')
                        .insert({
                          user_id: session.user.id,
                          event_type: 'lesson_completed',
                          lesson_id: lesson.id,
                          metadata: {
                            time_spent_minutes: timeSpent,
                            score: finalScore,
                            task_answers: taskAnswers,
                            followup_answers: followUpAnswers,
                            quiz_answers: quizAnswers
                          }
                        })

                      const { data: userData } = await supabase
                        .from('users')
                        .select('xp, level')
                        .eq('id', session.user.id)
                        .single()
                      
                      if (userData) {
                        const newXP = (userData.xp || 0) + finalXP
                        const newLevel = Math.floor(newXP / 100) + 1
                        
                        await supabase
                          .from('users')
                          .update({
                            xp: newXP,
                            level: newLevel
                          })
                          .eq('id', session.user.id)
                      }
                    }
                  } catch (error) {
                    console.error('Error completing lesson:', error)
                  }
                  
                  setShowRestartPrompt(false)
                  navigate('/testsecurev2')
                }}
                className="flex-1 px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Complete Anyway (+5 XP)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to render questions by type
const renderQuestionByType = (question, questionIndex, answerState, setAnswerState, dragDropOrder, setDragDropOrder, textAnswerEvaluations, setTextAnswerEvaluations, textAnswerAttempts, setTextAnswerAttempts, isQuiz = false, isAttempted = false, mixMatchState = {}, setMixMatchState = () => {}, progressionTimelineState = {}, setProgressionTimelineState = () => {}) => {
  if (!question) return null

  const questionType = question.type || question.questionFormat || 'multiple_choice'
  const questionKey = `question-${questionIndex}`
  const showResult = questionType === 'text_answer' || questionType === 'fill_in_blank'
    ? textAnswerEvaluations[questionIndex] !== undefined || answerState[questionIndex] !== undefined
    : answerState[questionIndex] !== undefined
  
  // For quiz questions, disable after one attempt
  const isDisabled = isQuiz && isAttempted

  if (questionType === 'text_answer') {
    const answerValue = answerState[questionIndex] || ''
    const evaluation = textAnswerEvaluations[questionIndex]
    const attempts = textAnswerAttempts[questionIndex] || { count: 0, wrongAnswers: [] }
    const hasAnswer = answerValue && answerValue.trim().length > 0
    // For quiz questions, only 1 attempt allowed. For tasks/follow-ups, 3 attempts allowed.
    const maxAttempts = isQuiz ? 1 : 3
    const isLocked = evaluation && !evaluation.isCorrect && attempts.count >= maxAttempts
    const canRetry = !isQuiz && evaluation && !evaluation.isCorrect && attempts.count < maxAttempts
    
    return (
      <div className="space-y-4">
        <textarea
          value={answerValue}
          onChange={(e) => setAnswerState({ ...answerState, [questionIndex]: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent"
          placeholder={
            isLocked 
              ? (isQuiz ? "Answer locked after 1 attempt (quiz)" : "Answer locked after 3 attempts")
              : "Type your answer here..."
          }
          rows={6}
          disabled={isLocked || (evaluation && evaluation.isCorrect) || (isQuiz && evaluation)}
        />
        
        {!evaluation && hasAnswer && !isDisabled && (
          <button
            onClick={async () => {
              const answer = answerValue
              const isCorrect = await evaluateTextAnswer(question.question, answer, question)
              const feedback = generateFeedback(question.question, answer, isCorrect)
              
              const newEvaluations = { 
                ...textAnswerEvaluations, 
                [questionIndex]: { isCorrect, answer, feedback } 
              }
              setTextAnswerEvaluations(newEvaluations)
              
              // For quiz questions, mark as attempted immediately after submission
              if (isQuiz) {
                // This will be handled by the parent component's callback
              }
              
              setTextAnswerAttempts({
                ...textAnswerAttempts,
                [questionIndex]: {
                  count: 1,
                  wrongAnswers: isCorrect ? [] : [{ answer, feedback }]
                }
              })
              setAnswerState({ ...answerState, [questionIndex]: answer })
            }}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Answer
          </button>
        )}
        
        {/* For quiz text answers, show message after submission */}
        {isQuiz && evaluation && (
          <div className={`p-3 rounded-lg ${
            evaluation.isCorrect 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm font-medium ${
              evaluation.isCorrect ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {evaluation.isCorrect ? '✓ Correct!' : '✗ Incorrect. You can continue to the next question.'}
            </p>
          </div>
        )}
        
        {canRetry && hasAnswer && !isQuiz && (
          <button
            onClick={async () => {
              const answer = answerValue
              const isCorrect = await evaluateTextAnswer(question.question, answer, question)
              const feedback = generateFeedback(question.question, answer, isCorrect)
              const newCount = attempts.count + 1
              const newWrongAnswers = isCorrect 
                ? attempts.wrongAnswers 
                : [...attempts.wrongAnswers, { answer, feedback }]
              
              setTextAnswerEvaluations({ 
                ...textAnswerEvaluations, 
                [questionIndex]: { isCorrect, answer, feedback } 
              })
              setTextAnswerAttempts({
                ...textAnswerAttempts,
                [questionIndex]: {
                  count: newCount,
                  wrongAnswers: newWrongAnswers
                }
              })
              setAnswerState({ ...answerState, [questionIndex]: answer })
            }}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Try Again ({maxAttempts - attempts.count} attempts remaining)
          </button>
        )}
        
        {/* For quiz questions, show message that only one attempt is allowed */}
        {isQuiz && evaluation && !evaluation.isCorrect && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Quiz questions only allow one attempt. You can continue to the next question.
            </p>
          </div>
        )}
        
        {evaluation && (
          <div className={`p-4 rounded-lg border-2 ${
            evaluation.isCorrect 
              ? 'bg-green-50 border-green-200' 
              : isLocked
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className={`text-xl ${
                evaluation.isCorrect 
                  ? 'text-green-600' 
                  : isLocked
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {evaluation.isCorrect ? '✓' : isLocked ? '✗' : '⚠'}
              </span>
              <div className="flex-1">
                <p className={`font-medium ${
                  evaluation.isCorrect 
                    ? 'text-green-800' 
                    : isLocked
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}>
                  {evaluation.isCorrect 
                    ? 'Correct!' 
                    : isLocked
                    ? (isQuiz ? 'Incorrect (Quiz - 1 attempt only)' : 'Incorrect after 3 attempts')
                    : `Not quite right (Attempt ${attempts.count}/${maxAttempts})`}
                </p>
                
                {isLocked && (
                  <div className="mt-3 space-y-3">
                    <div className="bg-white rounded p-3 border border-red-200">
                      <p className="font-semibold text-red-900 mb-2">Why your answers were incorrect:</p>
                      <ul className="space-y-2">
                        {attempts.wrongAnswers.map((wrong, idx) => (
                          <li key={idx} className="text-sm text-red-800">
                            <span className="font-medium">Attempt {idx + 1}:</span> "{wrong.answer.substring(0, 50)}{wrong.answer.length > 50 ? '...' : ''}"
                            <div className="mt-1 text-red-700">{wrong.feedback.whyIncorrect}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded p-3 border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">How to improve your answer:</p>
                      <p className="text-sm text-blue-800">{evaluation.feedback?.howToImprove || 'Review the lesson content and include key concepts mentioned in the question.'}</p>
                    </div>
                  </div>
                )}
                
                {!evaluation.isCorrect && !isLocked && (
                  <p className="text-sm text-yellow-700 mt-1">
                    {evaluation.feedback?.whyIncorrect || 'Review the lesson content and try to include key concepts in your answer.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (questionType === 'drag_drop') {
    const items = question.items || []
    const currentOrder = dragDropOrder[questionIndex] || [...items]
    const correctOrder = question.correct_order || []

    const handleDragStart = (e, index) => {
      e.dataTransfer.setData('text/plain', index.toString())
      e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e, dropIndex) => {
      e.preventDefault()
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
      if (dragIndex === dropIndex) return
      
      const newOrder = [...currentOrder]
      const [removed] = newOrder.splice(dragIndex, 1)
      newOrder.splice(dropIndex, 0, removed)
      setDragDropOrder({ ...dragDropOrder, [questionIndex]: newOrder })
    }

    const handleMoveUp = (index) => {
      if (index === 0) return
      const newOrder = [...currentOrder]
      const temp = newOrder[index]
      newOrder[index] = newOrder[index - 1]
      newOrder[index - 1] = temp
      setDragDropOrder({ ...dragDropOrder, [questionIndex]: newOrder })
    }

    const handleMoveDown = (index) => {
      if (index === currentOrder.length - 1) return
      const newOrder = [...currentOrder]
      const temp = newOrder[index]
      newOrder[index] = newOrder[index + 1]
      newOrder[index + 1] = temp
      setDragDropOrder({ ...dragDropOrder, [questionIndex]: newOrder })
    }

    // Check if order matches (correctOrder is array of indices)
    const correctItemsOrder = correctOrder.map(i => items[i])
    const isCorrect = showResult && JSON.stringify(currentOrder) === JSON.stringify(correctItemsOrder)

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">Arrange the items in the correct order:</p>
        <div className="space-y-2">
          {currentOrder.map((item, index) => (
            <div
              key={`${item}-${index}`}
              draggable={!showResult && !isDisabled}
              onDragStart={(e) => !isDisabled && handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => !isDisabled && handleDrop(e, index)}
              className={`flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg ${
                showResult || isDisabled ? '' : 'cursor-move hover:border-curare-blue'
              } ${isDisabled ? 'opacity-60' : ''} transition-colors`}
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-400 font-mono text-sm w-6">{index + 1}.</span>
                <span className="text-gray-900 flex-1">{item}</span>
              </div>
              {!showResult && !isDisabled && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === currentOrder.length - 1}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              )}
              {!showResult && !isDisabled && <span className="text-gray-400 text-lg">⋮⋮</span>}
            </div>
          ))}
        </div>

        {showResult && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-yellow-800'}`}>
              {isCorrect ? '✓ Correct order!' : 'Not quite right. Review the lesson content.'}
            </p>
          </div>
        )}

        {!showResult && (
          <button
            onClick={() => {
              const newOrder = { ...dragDropOrder, [questionIndex]: currentOrder }
              setDragDropOrder(newOrder)
            }}
            disabled={isDisabled}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              isDisabled
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-curare-blue text-white hover:bg-blue-700'
            }`}
          >
            {isDisabled ? 'Already Attempted' : 'Submit Order'}
          </button>
        )}
      </div>
    )
  }

  // Fill in the blank
  if (questionType === 'fill_in_blank') {
    const answerValue = answerState[questionIndex] || ''
    const correctAnswer = question.correct_answer || ''
    const isCorrect = answerValue.trim().toLowerCase() === correctAnswer.toLowerCase()
    const showResult = answerState[questionIndex] !== undefined && answerState[questionIndex] !== ''
    const attempts = textAnswerAttempts[questionIndex] || { count: 0, wrongAnswers: [] }
    const maxAttempts = isQuiz ? 1 : 3
    const isLocked = showResult && !isCorrect && attempts.count >= maxAttempts
    const canRetry = !isQuiz && showResult && !isCorrect && attempts.count < maxAttempts
    
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
            {question.question || question.text}
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fill in the blank:
          </label>
          <input
            type="text"
            value={answerValue}
            onChange={(e) => setAnswerState({ ...answerState, [questionIndex]: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent text-lg"
            placeholder="Type your answer here..."
            disabled={isLocked || (showResult && isCorrect) || (isQuiz && showResult)}
          />
        </div>
        
        {!showResult && answerValue.trim() && !isDisabled && (
          <button
            onClick={() => {
              const newAttempts = {
                ...textAnswerAttempts,
                [questionIndex]: {
                  count: (attempts.count || 0) + 1,
                  wrongAnswers: isCorrect ? [] : [...(attempts.wrongAnswers || []), { answer: answerValue }]
                }
              }
              setTextAnswerAttempts(newAttempts)
              setAnswerState({ ...answerState, [questionIndex]: answerValue })
            }}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Answer
          </button>
        )}
        
        {showResult && (
          <div className={`p-4 rounded-lg border-2 ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : isLocked
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className={`text-xl ${
                isCorrect 
                  ? 'text-green-600' 
                  : isLocked
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {isCorrect ? '✓' : isLocked ? '✗' : '⚠'}
              </span>
              <div className="flex-1">
                <p className={`font-medium ${
                  isCorrect 
                    ? 'text-green-800' 
                    : isLocked
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}>
                  {isCorrect 
                    ? 'Correct!' 
                    : isLocked
                    ? 'Incorrect after 3 attempts'
                    : `Not quite right (Attempt ${attempts.count || 1}/${maxAttempts})`}
                </p>
                {!isCorrect && !isLocked && (
                  <p className="text-sm text-yellow-700 mt-1">
                    The correct answer is: <strong>{correctAnswer}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {canRetry && (
          <button
            onClick={() => {
              setAnswerState({ ...answerState, [questionIndex]: '' })
            }}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Try Again ({maxAttempts - attempts.count} attempts remaining)
          </button>
        )}
      </div>
    )
  }

  // Mix & Match question type
  if (questionType === 'mix_match') {
    const isLightMode = localStorage.getItem('tsv2LightMode') === 'true'
    const state = mixMatchState[questionKey] || { selectedLeft: null, selectedRight: null, matchedPairs: [], attempts: 0, warnedPairs: [], isSubmitted: false }
    const { selectedLeft, selectedRight, matchedPairs, attempts, warnedPairs, isSubmitted } = state
    
    const leftItems = question.left_items || []
    const rightItems = question.right_items || []
    const correctPairs = question.correct_pairs || [] // Array of {left: index, right: index}
    
    // Check if all pairs are matched
    const allMatched = matchedPairs.length === leftItems.length
    
    // Handle selection
    const handleItemClick = (side, index) => {
      if (isSubmitted && allMatched) return
      
      const updateState = (updates) => {
        setMixMatchState({ ...mixMatchState, [questionKey]: { ...state, ...updates } })
      }
      
      if (side === 'left') {
        if (selectedLeft === index) {
          updateState({ selectedLeft: null })
        } else {
          const newSelectedLeft = index
          updateState({ selectedLeft: newSelectedLeft })
          // If right is selected, try to match
          if (selectedRight !== null) {
            checkMatch(newSelectedLeft, selectedRight, updateState)
          }
        }
      } else {
        if (selectedRight === index) {
          updateState({ selectedRight: null })
        } else {
          const newSelectedRight = index
          updateState({ selectedRight: newSelectedRight })
          // If left is selected, try to match
          if (selectedLeft !== null) {
            checkMatch(selectedLeft, newSelectedRight, updateState)
          }
        }
      }
    }
    
    const checkMatch = (leftIdx, rightIdx, updateState) => {
      const isCorrect = correctPairs.some(pair => pair.left === leftIdx && pair.right === rightIdx)
      
      if (isCorrect) {
        // Correct match
        const newMatchedPairs = [...matchedPairs, { left: leftIdx, right: rightIdx }]
        updateState({ 
          matchedPairs: newMatchedPairs,
          selectedLeft: null,
          selectedRight: null,
          warnedPairs: warnedPairs.filter(p => !(p.left === leftIdx && p.right === rightIdx))
        })
      } else {
        // Wrong match
        const newAttempts = attempts + 1
        const newWarnedPairs = (newAttempts === 1 || newAttempts === 2) 
          ? [...warnedPairs, { left: leftIdx, right: rightIdx }]
          : warnedPairs
        
        updateState({
          attempts: newAttempts,
          warnedPairs: newWarnedPairs,
          selectedLeft: null,
          selectedRight: null,
          isSubmitted: newAttempts >= 3
        })
      }
    }
    
    const getBoxVariant = (side, index) => {
      const isMatched = matchedPairs.some(p => (side === 'left' ? p.left : p.right) === index)
      const isSelected = (side === 'left' ? selectedLeft : selectedRight) === index
      const isWarned = warnedPairs.some(p => (side === 'left' ? p.left : p.right) === index)
      
      if (isMatched) return 'correct'
      if (isWarned && attempts >= 3) return 'wrong'
      if (isWarned) return 'warned'
      if (isSelected) return 'selected'
      return 'default'
    }
    
    const getBoxSrc = (variant, isLight) => {
      const lightSuffix = isLight ? '(light)' : ''
      const variants = {
        default: `/newboxdefault${lightSuffix}.svg`,
        selected: `/newboxselected${lightSuffix}.svg`,
        warned: `/newboxwarned${lightSuffix}.svg`,
        wrong: `/newboxwrong${lightSuffix}.svg`,
        correct: `/newboxcorrect${lightSuffix}.svg`
      }
      return variants[variant] || variants.default
    }
    
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 mb-4">Match the items from the left column to the right column:</p>
        <div className="flex gap-8 justify-center">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {leftItems.map((item, index) => {
              const variant = getBoxVariant('left', index)
              const isMatched = matchedPairs.some(p => p.left === index)
              return (
                <div
                  key={`left-${index}`}
                  onClick={() => !isMatched && handleItemClick('left', index)}
                  style={{
                    cursor: isMatched ? 'default' : 'pointer',
                    width: '200px',
                    height: 'auto',
                    position: 'relative'
                  }}
                >
                  <img
                    src={getBoxSrc(variant, isLightMode)}
                    alt={`Left item ${index + 1}`}
                    style={{ width: '200px', height: 'auto', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '16px',
                    color: isLightMode ? '#000000' : '#ffffff',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    width: '90%'
                  }}>
                    {item}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {rightItems.map((item, index) => {
              const variant = getBoxVariant('right', index)
              const isMatched = matchedPairs.some(p => p.right === index)
              return (
                <div
                  key={`right-${index}`}
                  onClick={() => !isMatched && handleItemClick('right', index)}
                  style={{
                    cursor: isMatched ? 'default' : 'pointer',
                    width: '200px',
                    height: 'auto',
                    position: 'relative'
                  }}
                >
                  <img
                    src={getBoxSrc(variant, isLightMode)}
                    alt={`Right item ${index + 1}`}
                    style={{ width: '200px', height: 'auto', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '16px',
                    color: isLightMode ? '#000000' : '#ffffff',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    width: '90%'
                  }}>
                    {item}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {isSubmitted && attempts >= 3 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">
              ✗ Incorrect after 3 attempts. Question skipped.
            </p>
            <button
              onClick={() => {
                setAnswerState({ ...answerState, [questionIndex]: matchedPairs })
              }}
              className="mt-2 w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
        
        {allMatched && !isSubmitted && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">
              ✓ All matches correct!
            </p>
          </div>
        )}
        
        {allMatched && !isSubmitted && (
          <button
            onClick={() => {
              setAnswerState({ ...answerState, [questionIndex]: matchedPairs })
            }}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    )
  }

  // Progression Timeline question type
  if (questionType === 'progression_timeline') {
    const isLightMode = localStorage.getItem('tsv2LightMode') === 'true'
    const state = progressionTimelineState[questionKey] || { 
      timelineSlots: [null, null, null, null], 
      draggedItem: null, 
      hoveredSlot: null, 
      isSubmitted: false, 
      attempts: 0, 
      slotStates: ['unselected', 'unselected', 'unselected', 'unselected'] 
    }
    const { timelineSlots, draggedItem, hoveredSlot, isSubmitted, attempts, slotStates } = state
    
    const items = question.items || []
    const correctOrder = question.correct_order || [] // Array of indices [0, 1, 2, 3]
    
    const updateState = (updates) => {
      setProgressionTimelineState({ ...progressionTimelineState, [questionKey]: { ...state, ...updates } })
    }
    
    const handleDragStart = (e, itemIndex) => {
      updateState({ draggedItem: itemIndex })
      e.dataTransfer.effectAllowed = 'move'
    }
    
    const handleDragOver = (e, slotIndex) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      updateState({ hoveredSlot: slotIndex })
    }
    
    const handleDragLeave = () => {
      updateState({ hoveredSlot: null })
    }
    
    const handleDrop = (e, slotIndex) => {
      e.preventDefault()
      if (draggedItem === null) return
      
      const newSlots = [...timelineSlots]
      // Remove item from previous slot if it exists
      const prevSlot = newSlots.findIndex(slot => slot === draggedItem)
      if (prevSlot !== -1) {
        newSlots[prevSlot] = null
      }
      // Place in new slot
      newSlots[slotIndex] = draggedItem
      
      // Update slot state to default
      const newStates = [...slotStates]
      newStates[slotIndex] = 'default'
      
      updateState({ 
        timelineSlots: newSlots,
        slotStates: newStates,
        draggedItem: null,
        hoveredSlot: null
      })
    }
    
    const handleSubmit = () => {
      const newAttempts = attempts + 1
      const newStates = timelineSlots.map((item, index) => {
        if (item === null) return 'unselected'
        const correctItem = correctOrder[index]
        if (item === correctItem) return 'correct'
        return newAttempts === 1 ? 'warned' : 'wrong'
      })
      updateState({ 
        isSubmitted: true,
        attempts: newAttempts,
        slotStates: newStates
      })
    }
    
    const allSlotsFilled = timelineSlots.every(slot => slot !== null)
    const isCorrect = timelineSlots.every((item, index) => item === correctOrder[index])
    
    const getSlotSrc = (state, isLight) => {
      const lightSuffix = isLight ? '(light)' : ''
      if (state === 'unselected') return `/newboxunselected${lightSuffix}.svg`
      if (state === 'default') return `/newboxdefault${lightSuffix}.svg`
      if (state === 'correct') return `/newboxcorrect${lightSuffix}.svg`
      if (state === 'warned') return `/newboxwarned${lightSuffix}.svg`
      if (state === 'wrong') return `/newboxwrong${lightSuffix}.svg`
      return `/newboxunselected${lightSuffix}.svg`
    }
    
    return (
      <div className="space-y-6">
        <p className="text-sm text-gray-600 mb-4">Drag the items below into the correct order:</p>
        
        {/* Timeline Slots */}
        <div className="flex justify-center gap-4">
          {timelineSlots.map((item, index) => {
            const slotState = slotStates[index]
            const isHovered = hoveredSlot === index && draggedItem !== null
            return (
              <div
                key={`slot-${index}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                style={{
                  width: '200px',
                  height: 'auto',
                  position: 'relative',
                  border: isHovered ? '2px dashed #2563eb' : 'none',
                  borderRadius: '8px',
                  padding: isHovered ? '4px' : '0'
                }}
              >
                <img
                  src={getSlotSrc(slotState, isLightMode)}
                  alt={`Timeline slot ${index + 1}`}
                  style={{ width: '200px', height: 'auto', display: 'block' }}
                />
                {item !== null && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '16px',
                    color: isLightMode ? '#000000' : '#ffffff',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    width: '90%'
                  }}>
                    {items[item]}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Draggable Items */}
        <div className="flex justify-center gap-4">
          {items.map((item, index) => {
            const isPlaced = timelineSlots.includes(index)
            return (
              <div
                key={`item-${index}`}
                draggable={!isPlaced && !isSubmitted}
                onDragStart={(e) => !isPlaced && handleDragStart(e, index)}
                style={{
                  width: '200px',
                  height: 'auto',
                  cursor: isPlaced || isSubmitted ? 'default' : 'grab',
                  opacity: isPlaced ? 0.5 : 1,
                  position: 'relative'
                }}
              >
                <img
                  src={`/newboxdefault${isLightMode ? '(light)' : ''}.svg`}
                  alt={`Item ${index + 1}`}
                  style={{ width: '200px', height: 'auto', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  color: isLightMode ? '#000000' : '#ffffff',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  width: '90%'
                }}>
                  {item}
                </div>
              </div>
            )
          })}
        </div>
        
        {isSubmitted && (
          <div className={`p-4 rounded-lg ${
            isCorrect && attempts === 1
              ? 'bg-green-50 border border-green-200'
              : attempts === 1
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              isCorrect && attempts === 1
                ? 'text-green-800'
                : attempts === 1
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {isCorrect && attempts === 1
                ? '✓ Correct order!'
                : attempts === 1
                ? '⚠ Not quite right. Try again.'
                : '✗ Incorrect order.'}
            </p>
          </div>
        )}
        
        {allSlotsFilled && !isSubmitted && (
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        )}
        
        {isSubmitted && (
          <button
            onClick={() => {
              setAnswerState({ ...answerState, [questionIndex]: timelineSlots })
            }}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    )
  }

  // Short Answer Yourself question type
  if (questionType === 'short_answer_yourself') {
    const isLightMode = localStorage.getItem('tsv2LightMode') === 'true'
    const answerValue = answerState[questionIndex] || ''
    const evaluation = textAnswerEvaluations[questionIndex]
    const attempts = textAnswerAttempts[questionIndex] || { count: 0, wrongAnswers: [] }
    const maxAttempts = 2
    const isLocked = evaluation && !evaluation.isCorrect && attempts.count >= maxAttempts
    const canRetry = evaluation && !evaluation.isCorrect && attempts.count < maxAttempts
    
    const handleSubmit = async () => {
      const answer = answerValue
      const isCorrect = await evaluateTextAnswer(question.question, answer, question)
      const feedback = generateFeedback(question.question, answer, isCorrect)
      
      const newEvaluations = { 
        ...textAnswerEvaluations, 
        [questionIndex]: { isCorrect, answer, feedback } 
      }
      setTextAnswerEvaluations(newEvaluations)
      
      setTextAnswerAttempts({
        ...textAnswerAttempts,
        [questionIndex]: {
          count: attempts.count + 1,
          wrongAnswers: isCorrect ? [] : [...attempts.wrongAnswers, { answer, feedback }]
        }
      })
      setAnswerState({ ...answerState, [questionIndex]: answer })
    }
    
    return (
      <div className="space-y-4">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652'
          }} />
          <div style={{
            width: '100%',
            height: '2px',
            backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652'
          }} />
        </div>
        
        <input
          type="text"
          value={answerValue}
          onChange={(e) => {
            const newValue = e.target.value
            // Limit to 2 lines (approximately 100 characters per line)
            if (newValue.length <= 200) {
              setAnswerState({ ...answerState, [questionIndex]: newValue })
            }
          }}
          style={{
            width: '100%',
            padding: '8px 0',
            border: 'none',
            borderBottom: `2px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`,
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            color: isLightMode ? '#000000' : '#ffffff',
            backgroundColor: 'transparent',
            outline: 'none'
          }}
          placeholder="Type your answer here..."
          disabled={isLocked || (evaluation && evaluation.isCorrect)}
          maxLength={200}
        />
        
        {!evaluation && answerValue.trim() && !isLocked && (
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit Answer
          </button>
        )}
        
        {canRetry && (
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            Try Again ({maxAttempts - attempts.count} attempts remaining)
          </button>
        )}
        
        {evaluation && (
          <div className={`p-4 rounded-lg border-2 ${
            evaluation.isCorrect 
              ? 'bg-green-50 border-green-200' 
              : isLocked
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className={`text-xl ${
                evaluation.isCorrect 
                  ? 'text-green-600' 
                  : isLocked
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {evaluation.isCorrect ? '✓' : isLocked ? '✗' : '⚠'}
              </span>
              <div className="flex-1">
                <p className={`font-medium ${
                  evaluation.isCorrect 
                    ? 'text-green-800' 
                    : isLocked
                    ? 'text-red-800'
                    : 'text-yellow-800'
                }`}>
                  {evaluation.isCorrect 
                    ? 'Correct!' 
                    : isLocked
                    ? 'Incorrect after 2 attempts'
                    : `Not quite right (Attempt ${attempts.count}/${maxAttempts})`}
                </p>
                {!evaluation.isCorrect && !isLocked && (
                  <p className="text-sm text-yellow-700 mt-1">
                    {evaluation.feedback?.whyIncorrect || 'Review the lesson content and try again.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default: multiple choice
  return (
    <div className="space-y-2">
      {question.options?.map((option, index) => {
        const isSelected = answerState[questionIndex] === index
        const isCorrect = index === question.correct
        const showResult = answerState[questionIndex] !== undefined
        
        return (
          <button
            key={index}
            onClick={() => {
              if (!showResult && !isDisabled) {
                setAnswerState({ ...answerState, [questionIndex]: index })
                // For quiz questions, mark as attempted immediately
                if (isQuiz) {
                  // This will be handled by the parent component
                }
              }
            }}
            className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-colors ${
              isDisabled
                ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                : showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : isSelected && !isCorrect
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
                : isSelected
                ? 'border-curare-blue bg-blue-50'
                : 'border-gray-200 hover:border-curare-blue hover:bg-blue-50'
            }`}
            disabled={showResult || isDisabled}
          >
            {option}
            {showResult && isCorrect && <span className="ml-2 text-green-600">✓</span>}
            {showResult && isSelected && !isCorrect && <span className="ml-2 text-red-600">✗</span>}
            {isDisabled && !showResult && <span className="ml-2 text-gray-500 text-sm">(Already attempted)</span>}
          </button>
        )
      })}
    </div>
  )
}

// AI-powered text answer evaluation
const evaluateTextAnswer = async (question, answer, questionData) => {
  // Simple keyword-based evaluation (can be enhanced with OpenAI API later)
  const answerLower = answer.toLowerCase().trim()
  const questionLower = question.toLowerCase()
  
  // Extract key concepts from the question
  const keyTerms = extractKeyTerms(questionLower)
  
  // Check if answer contains relevant key terms
  const relevantTermsFound = keyTerms.filter(term => answerLower.includes(term)).length
  const relevanceScore = relevantTermsFound / Math.max(keyTerms.length, 1)
  
  // Check answer length (too short = likely incomplete)
  const hasSubstance = answer.length > 20
  
  // Check for common medical/anatomy terms if question is about those topics
  const medicalTerms = ['system', 'organ', 'cell', 'tissue', 'function', 'work', 'together', 'body', 'health']
  const hasMedicalContext = medicalTerms.some(term => answerLower.includes(term))
  
  // Determine if answer is correct
  // For now, we'll be lenient - if it has substance and some relevance, mark as correct
  // This can be made stricter or use OpenAI API for better evaluation
  const isCorrect = hasSubstance && (relevanceScore > 0.3 || hasMedicalContext)
  
  return isCorrect
}

// Generate detailed feedback for wrong answers
const generateFeedback = (question, answer, isCorrect) => {
  if (isCorrect) {
    return {
      whyIncorrect: null,
      howToImprove: null
    }
  }
  
  const answerLower = answer.toLowerCase().trim()
  const questionLower = question.toLowerCase()
  const keyTerms = extractKeyTerms(questionLower)
  const missingTerms = keyTerms.filter(term => !answerLower.includes(term))
  
  // Generate why it's incorrect
  let whyIncorrect = "Your answer doesn't fully address the question. "
  if (missingTerms.length > 0) {
    whyIncorrect += `You're missing key concepts like: ${missingTerms.slice(0, 3).join(', ')}. `
  }
  if (answer.length < 20) {
    whyIncorrect += "Your answer is too brief and needs more detail. "
  }
  whyIncorrect += "Try to explain the relationship between concepts and provide specific examples."
  
  // Generate how to improve
  let howToImprove = "To improve your answer: "
  if (missingTerms.length > 0) {
    howToImprove += `Include information about ${missingTerms.slice(0, 2).join(' and ')}. `
  }
  howToImprove += "Explain how different parts work together, provide examples from the lesson, and connect your answer to the main concepts covered."
  
  // Add specific guidance based on question type
  if (questionLower.includes('system')) {
    howToImprove += " Focus on how systems interact and depend on each other."
  } else if (questionLower.includes('organ')) {
    howToImprove += " Explain which system the organ belongs to and its specific function."
  } else if (questionLower.includes('cell')) {
    howToImprove += " Describe how cells form tissues and organs, and their role in the body."
  }
  
  return {
    whyIncorrect,
    howToImprove
  }
}

// Extract key terms from question
const extractKeyTerms = (question) => {
  const stopWords = ['what', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'how', 'why', 'when', 'where', 'which', 'who']
  const words = question.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .map(word => word.toLowerCase().replace(/[^\w]/g, ''))
  
  return [...new Set(words)].slice(0, 5) // Get top 5 unique key terms
}

// Helper function to check if question is answered
const isQuestionAnswered = (question, questionIndex, quizAnswers, dragDropOrder, textAnswerEvaluations = {}, textAnswerAttempts = {}, isQuiz = false) => {
  if (!question) return false
  
  const questionType = question.type || 'multiple_choice'
  
  if (questionType === 'text_answer') {
    // For quiz text answers, require evaluation to be done (only one attempt allowed)
    if (isQuiz) {
      const evaluation = textAnswerEvaluations[questionIndex]
      return evaluation !== undefined // For quiz, any evaluation (correct or wrong) counts as answered
    }
    
    // For non-quiz text answers, require evaluation to be done (either correct or locked after 3 attempts)
    const evaluation = textAnswerEvaluations[questionIndex]
    if (!evaluation) return false
    
    const attempts = textAnswerAttempts[questionIndex] || { count: 0 }
    // Answer is considered "answered" if correct OR if locked after 3 attempts
    return evaluation.isCorrect || (!evaluation.isCorrect && attempts.count >= 3)
  }
  
  if (questionType === 'drag_drop') {
    return dragDropOrder[questionIndex] && dragDropOrder[questionIndex].length > 0
  }
  
  return quizAnswers[questionIndex] !== undefined
}

export default LessonPlayer

