import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Transition from './Transition'
import { getLessonQuestions, getLessonMetadata } from '../data/lessons/lessonLoader'
import DebugPanel from '../components/DebugPanel'
import { getInitialLightMode } from '../utils/lightModeInit'

const Lesson = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { lessonId } = useParams()
  const lessonIdNum = parseInt(lessonId, 10)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [isContinueButtonPressed, setIsContinueButtonPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const transitionRef = useRef(null)
  const [isLightMode, setIsLightMode] = useState(getInitialLightMode)


  // Get lesson questions and metadata
  const questions = getLessonQuestions(lessonIdNum)
  const lessonMetadata = getLessonMetadata(lessonIdNum)

  // Hide loading overlay after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // 300ms delay for smooth transition
    
    return () => clearTimeout(timer)
  }, [lessonIdNum]) // Reset when lesson changes

  const handleQuit = () => {
    setShowQuitModal(true)
  }

  const handleQuitConfirm = () => {
    // Navigate back to lesson selection panel
    setShowQuitModal(false)
    navigate('/testsecurev2')
  }

  const handleQuitCancel = () => {
    setShowQuitModal(false)
  }

  const handleLessonComplete = () => {
    // Persist completion
    try {
      const stored = localStorage.getItem('tsv2Completed')
      let arr = []
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) arr = parsed
      }
      const lessonIdOneBased = lessonIdNum
      if (!arr.includes(lessonIdOneBased)) {
        arr.push(lessonIdOneBased)
        localStorage.setItem('tsv2Completed', JSON.stringify(arr))
        
        // CRITICAL: Set completion date so updateDailyLessonCount can count it for streak
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const todayKey = `${year}-${month}-${day}`
        localStorage.setItem(`tsv2LessonCompletion_${lessonIdOneBased}`, todayKey)
        
        // Mark today as having a meaningful action
        const storageKey = `tsv2DailyLessons_${todayKey}`
        localStorage.setItem(storageKey, '1')
      }
    } catch (e) {
      console.error('Failed to persist completion', e)
    }
    // Navigate back to roadmap
    navigate('/testsecurev2')
  }

  // If lesson doesn't exist, show error
  if (!lessonMetadata || questions.length === 0) {
    return (
      <div style={{ 
        backgroundColor: '#161d25', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white',
        fontFamily: "'Unbounded', sans-serif",
        fontSize: '24px'
      }}>
        Lesson {lessonId} not found
      </div>
    )
  }

  const handleDebugCorrect = () => {
    if (transitionRef.current) {
      transitionRef.current.triggerCorrect()
    }
  }

  const handleDebugWrong = () => {
    if (transitionRef.current) {
      transitionRef.current.triggerWrong()
    }
  }

  return (
    <>
      {/* Loading Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isLightMode ? '#ffffff' : '#161d25',
          zIndex: 999999,
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: isLoading ? 'auto' : 'none'
        }}
      />
      
      <Transition 
        ref={transitionRef}
        questions={questions} 
        onLessonComplete={handleLessonComplete}
        onQuit={handleQuit}
        lessonId={lessonIdNum}
        isLightMode={isLightMode}
      />
      
      <DebugPanel 
        onAnswerCorrect={handleDebugCorrect}
        onAnswerWrong={handleDebugWrong}
      />
      
      {/* Quit Modal */}
      {/* Darkening Overlay - Always rendered for smooth transition */}
      <div
        onClick={handleQuitCancel}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: showQuitModal ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
          transition: 'background-color 0.4s ease',
          zIndex: 1000001,
          pointerEvents: showQuitModal ? 'auto' : 'none'
        }}
      />
      
      {/* Quit Modal Panel - Always rendered for smooth transition */}
      {showQuitModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: isLightMode ? '#ffffff' : '#161d25',
            borderRadius: '12px',
            padding: '32px',
            zIndex: 1000002,
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
            <h3 style={{ 
              color: isLightMode ? '#000000' : 'white', 
              fontSize: '20px', 
              fontWeight: 600, 
              fontFamily: "'Unbounded', sans-serif", 
              marginBottom: '16px' 
            }}>
              Are you sure?
            </h3>
            <p style={{ 
              color: isLightMode ? '#000000' : 'white', 
              fontSize: '16px', 
              fontFamily: "'Inter Tight', sans-serif", 
              marginBottom: '24px' 
            }}>
              If you quit, your progress and XP will be reset.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                onClick={handleQuitConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: isLightMode ? '#000000' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 500
                }}
              >
                Quit
              </button>
              <button
                onClick={handleQuitCancel}
                onMouseDown={() => setIsContinueButtonPressed(true)}
                onMouseUp={() => setIsContinueButtonPressed(false)}
                onMouseLeave={() => setIsContinueButtonPressed(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'inline-block',
                  width: '133px'
                }}
              >
                <img
                  src={isContinueButtonPressed 
                    ? `/continuepressed${isLightMode ? '(light)' : ''}.svg` 
                    : `/continue${isLightMode ? '(light)' : ''}.svg`}
                  alt="Continue"
                  draggable="false"
                  style={{
                    width: '133px',
                    height: 'auto',
                    display: 'block',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none'
                  }}
                />
              </button>
            </div>
        </div>
      )}
    </>
  )
}

export default Lesson
