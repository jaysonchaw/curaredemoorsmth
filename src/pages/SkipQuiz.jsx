import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Transition from './Transition'
import { getSkipQuizQuestions, skipQuizExists } from '../data/skipQuizzes/skipQuizLoader'
import DebugPanel from '../components/DebugPanel'
import { getInitialLightMode } from '../utils/lightModeInit'

const SkipQuiz = () => {
  const navigate = useNavigate()
  const { unitId } = useParams()
  const unitIdNum = parseInt(unitId, 10)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [isContinueButtonPressed, setIsContinueButtonPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const transitionRef = useRef(null)
  const [isLightMode, setIsLightMode] = useState(getInitialLightMode)

  // Get skip quiz questions
  const questions = getSkipQuizQuestions(unitIdNum)

  // Hide loading overlay after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // 300ms delay for smooth transition
    
    return () => clearTimeout(timer)
  }, [unitIdNum]) // Reset when quiz changes

  const handleQuit = () => {
    setShowQuitModal(true)
  }

  const handleQuitConfirm = () => {
    // Navigate back to lesson selection panel
    setShowQuitModal(false)
    navigate('/')
  }

  const handleQuitCancel = () => {
    setShowQuitModal(false)
  }

  const handleSkipQuizComplete = () => {
    // Auto-complete all items from the previous unit (not including current unit's first lesson)
    try {
      // Unit structure (same as TestSecureV2)
      const units = [
        ['Unit 1: Foundations of Human Biology', 0, 3],
        ['Unit 2: Structure and Control of the Body', 4, 12],
        ['Unit 3: Transport and Energy in the Body', 13, 20],
        ['Unit 4: Protection and Immune Health', 21, 28],
        ['Unit 5: Growth and Everyday Health', 29, 35],
        ['Unit 6: Genetics and Modern Medicine', 36, 45]
      ]
      
      const lessonNames = [
        'Human Body Systems',
        'Cells',
        'Personalized Practice',
        'Review',
        'Tissues and Organs',
        'Skeletal System',
        'Muscular System',
        'Personalized Practice',
        'Nervous System',
        'Five Senses',
        'Personalized Practice',
        'Endocrine System',
        'Review',
        'Circulatory System',
        'Respiratory System',
        'Personalized Practice',
        'Digestive System',
        'Nutrition',
        'Personalized Practice',
        'Water and Hydration',
        'Review',
        'Skin',
        'Immune System',
        'Personalized Practice',
        'Germs',
        'Vaccines and Antibiotics',
        'Personalized Practice',
        'Hygiene',
        'Review',
        'Exercise and Fitness',
        'Sleep and Growth',
        'Personalized Practice',
        'Oral Health',
        'Puberty and Reproduction',
        'Personalized Practice',
        'Review',
        'DNA and Heredity',
        'Cancer',
        'Personalized Practice',
        'Allergies',
        'Asthma',
        'Personalized Practice',
        'Medical Imaging',
        'Organ Transplants',
        'Personalized Practice',
        'Review'
      ]
      
      // Get previous unit (unitIdNum is 1-based, so unitIdNum - 2 gives 0-based index)
      const prevUnitIndex = unitIdNum - 2
      if (prevUnitIndex >= 0 && prevUnitIndex < units.length) {
        const [_, prevStartIndex, prevEndIndex] = units[prevUnitIndex]
        
        // Get current day key
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const todayKey = `${year}-${month}-${day}`
        
        // Get completed lessons array
        const stored = localStorage.getItem('tsv2Completed')
        let completedLessons = []
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) completedLessons = parsed
        }
        
        // Get completed items array (for personalized practice, reviews)
        const storedItems = localStorage.getItem('tsv2CompletedItems')
        let completedItems = []
        if (storedItems) {
          const parsed = JSON.parse(storedItems)
          if (Array.isArray(parsed)) completedItems = parsed
        }
        
        // Helper function to get actual lesson ID from index (counts only lessons, not Personalized Practice/Review)
        // This MUST match the logic in TestSecureV2.jsx
        const getActualLessonIndex = (index) => {
          let actualLessonId = 1
          for (let i = 0; i <= index; i++) {
            const name = lessonNames[i]
            if (name !== 'Personalized Practice' && name !== 'Review') {
              if (i === index) return actualLessonId
              actualLessonId++
            }
          }
          return actualLessonId
        }
        
        // Mark all items from previous unit as completed
        for (let index = prevStartIndex; index <= prevEndIndex; index++) {
          const name = lessonNames[index]
          
          if (name === 'Personalized Practice') {
            // Mark personalized practice by index
            if (!completedItems.includes(index)) {
              completedItems.push(index)
            }
          } else if (name === 'Review') {
            // Mark review by unit number (prevUnitIndex + 1, since units are 1-based)
            const reviewKey = `review_${prevUnitIndex + 1}`
            if (!completedItems.includes(reviewKey)) {
              completedItems.push(reviewKey)
            }
          } else {
            // It's a lesson - use getActualLessonIndex to get the correct lesson ID
            const lessonId = getActualLessonIndex(index)
            if (!completedLessons.includes(lessonId)) {
              completedLessons.push(lessonId)
              // CRITICAL: Set completion date so updateDailyLessonCount can count it
              localStorage.setItem(`tsv2LessonCompletion_${lessonId}`, todayKey)
            }
          }
        }
        
        // Save updated arrays
        localStorage.setItem('tsv2Completed', JSON.stringify(completedLessons))
        localStorage.setItem('tsv2CompletedItems', JSON.stringify(completedItems))
      }
      
      // Mark skip quiz as completed
      const storedItemsFinal = localStorage.getItem('tsv2CompletedItems')
      let itemsArr = []
      if (storedItemsFinal) {
        const parsed = JSON.parse(storedItemsFinal)
        if (Array.isArray(parsed)) itemsArr = parsed
      }
      const skipQuizKey = `skipQuiz_${unitIdNum}`
      if (!itemsArr.includes(skipQuizKey)) {
        itemsArr.push(skipQuizKey)
        localStorage.setItem('tsv2CompletedItems', JSON.stringify(itemsArr))
        
        // Mark skip quiz as completed today for streak tracking
        localStorage.setItem(`tsv2SkipQuizCompletion_${skipQuizKey}`, todayKey)
        
        // Mark today as having a meaningful action
        const storageKey = `tsv2DailyLessons_${todayKey}`
        localStorage.setItem(storageKey, '1')
      }
      
      // Update daily lesson count to recalculate streak
      // This ensures the streak is updated after completing a skip quiz
      if (window.updateDailyLessonCount) {
        window.updateDailyLessonCount()
      }
    } catch (e) {
      console.error('Failed to persist skip quiz completion', e)
    }
    // Navigate back to roadmap
    navigate('/')
  }

  // If skip quiz doesn't exist, show error
  if (!skipQuizExists(unitIdNum) || questions.length === 0) {
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
        Skip quiz for Unit {unitId} not found
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
        onLessonComplete={handleSkipQuizComplete}
        onQuit={handleQuit}
        lessonId={unitIdNum}
        isLightMode={isLightMode}
        showContentButton={false}
        isReviewOrSkipQuiz={true}
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

export default SkipQuiz

