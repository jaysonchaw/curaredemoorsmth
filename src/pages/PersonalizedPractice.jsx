import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IllustratedMCQ from './IllustratedMCQ'
import MCQ from './MCQ'
import FillInTheBlank from './FillInTheBlank'
import AnswerYourself from './AnswerYourself'
import { getPersonalizedPracticeQuestions } from '../utils/personalizedPractice'
import { recordAnswer } from '../utils/answerTracker'

const PersonalizedPractice = () => {
  const navigate = useNavigate()
  const { practiceIndex } = useParams()
  const practiceIndexNum = parseInt(practiceIndex, 10)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [isContinueButtonPressed, setIsContinueButtonPressed] = useState(false)
  
  // Get lessonNames - same as TestSecureV2
  const lessonNames = [
    'Human Body Systems',
    'Cells',
    'Personalized Practice',
    'Tissues and Organs',
    'Review',
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
    'Review',
    'Water and Hydration',
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

  // State for managing practice
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shouldShowNext, setShouldShowNext] = useState(false)
  const [isInTransition, setIsInTransition] = useState(false)
  const [progressCount, setProgressCount] = useState(0) // Tracks progress: 1 = correct, 0.5 = warned
  const [practiceProgress, setPracticeProgress] = useState(0) // Progress for progress bar (0-1)
  const [questionResults, setQuestionResults] = useState({}) // Track results per question index
  const [wrongOrWarnedQuestions, setWrongOrWarnedQuestions] = useState([]) // Questions to potentially re-add
  const [isLoading, setIsLoading] = useState(true)
  const questionComponentRef = useRef(null)

  // Initialize practice questions
  useEffect(() => {
    setIsLoading(true)
    const loadQuestions = async () => {
      const practiceQuestions = await getPersonalizedPracticeQuestions(practiceIndexNum, lessonNames, 5)
      
      if (practiceQuestions.length === 0) {
        alert('No questions available for personalized practice. Complete some lessons first!')
        navigate('/')
        return
      }
      
      // Transform questions to match question component format
      const formattedQuestions = practiceQuestions.map((q, idx) => ({
        ...q.question,
        _practiceMeta: {
          lessonId: q.lessonId,
          originalQuestionIndex: q.questionIndex,
          questionPosition: q.questionPosition,
          practiceIndex: idx
        }
      }))
      
      setQuestions(formattedQuestions)
      setPracticeProgress(0) // Reset progress when questions change
      
      // Hide loading overlay after a brief moment
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      
      return () => clearTimeout(timer)
    }
    
    loadQuestions()
  }, [practiceIndexNum, navigate])

  const handleQuit = () => {
    setShowQuitModal(true)
  }

  const handleQuitConfirm = () => {
    setShowQuitModal(false)
    navigate('/')
  }

  const handleQuitCancel = () => {
    setShowQuitModal(false)
  }

  // Handle answer result
  const handleAnswerResult = (result) => {
    const question = questions[currentQuestionIndex]
    if (!question || questionResults[currentQuestionIndex]) return // Don't record twice

    // Store result
    setQuestionResults(prev => ({
      ...prev,
      [currentQuestionIndex]: result
    }))

    // Track answer for the original lesson
    if (question._practiceMeta && (result === 'warned' || result === 'wrong')) {
      // Fire and forget - don't await to avoid blocking UI
      recordAnswer(
        question._practiceMeta.lessonId,
        question._practiceMeta.originalQuestionIndex,
        result
      ).catch(err => {
        console.error('Failed to record answer', err)
      })
      
      // Add to wrong/warned list for potential re-appearance
      setWrongOrWarnedQuestions(prev => {
        if (!prev.find(q => q.index === currentQuestionIndex)) {
          return [...prev, { index: currentQuestionIndex, question }]
        }
        return prev
      })
    }

    // Update progress
    if (result === 'correct') {
      setProgressCount(prev => {
        const newCount = prev + 1
        // Progress bar: progressCount / 5 (target is 5)
        setPracticeProgress(newCount / 5)
        return newCount
      })
    } else if (result === 'warned') {
      setProgressCount(prev => {
        const newCount = prev + 0.5
        // Progress bar: progressCount / 5 (target is 5)
        setPracticeProgress(newCount / 5)
        return newCount
      })
    }
    // Wrong doesn't advance progress (0 for progress bar)
  }

  const handleCorrectAnswer = () => {
    handleAnswerResult('correct')
  }

  const handleContinue = () => {
    // Check if practice is complete
    if (progressCount >= 5) {
      // Mark practice as completed
      try {
        const stored = localStorage.getItem('tsv2CompletedItems')
        let arr = []
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) arr = parsed
        }
        if (!arr.includes(practiceIndexNum)) {
          arr.push(practiceIndexNum)
          localStorage.setItem('tsv2CompletedItems', JSON.stringify(arr))
        }
      } catch (e) {
        console.error('Failed to persist practice completion', e)
      }
      navigate('/')
      return
    }

    // Check if we need more questions
    const remainingProgress = 5 - progressCount
    const questionsRemaining = questions.length - (currentQuestionIndex + 1)
    
    // If we need more progress and have wrong/warned questions, add them back
    if (remainingProgress > 0 && wrongOrWarnedQuestions.length > 0 && questionsRemaining === 0) {
      // Add wrong/warned questions back to the pool
      const questionsToAdd = wrongOrWarnedQuestions
        .slice(0, Math.ceil(remainingProgress * 2)) // Add enough to potentially complete
        .map(item => item.question)
      
      setQuestions(prev => [...prev, ...questionsToAdd])
      setWrongOrWarnedQuestions([]) // Clear the list
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      
      // Phase 1: Old question scrolls up
      setIsTransitioning(true)
      setIsInTransition(true)
      
      // Phase 2: After old question scrolls up, prepare new question
      setTimeout(() => {
        setIsTransitioning(false)
        setShouldShowNext(true)
        setIsInTransition(true)
        
        setCurrentQuestionIndex(nextIndex)
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              setIsInTransition(false)
              setTimeout(() => {
                setShouldShowNext(false)
              }, 300)
            }, 50)
          })
        })
      }, 300)
    } else {
      // No more questions - complete practice
      navigate('/')
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <div style={{ 
        backgroundColor: '#161d25', 
        minHeight: '100vh'
      }} />
    )
  }

  // Get the original lessonId from the question's metadata for book content
  const originalLessonId = currentQuestion._practiceMeta?.lessonId || 0

  const commonProps = {
    onContinue: handleContinue,
    onCorrectAnswer: handleCorrectAnswer,
    onAnswerResult: handleAnswerResult,
    isInTransition,
    isTransitioning,
    shouldShowNext,
    questionData: currentQuestion,
    questionIndex: currentQuestionIndex,
    answeredCount: Object.keys(questionResults).length,
    correctAnswersCount: Object.values(questionResults).filter(r => r === 'correct').length,
    lastThreeQuestions: ['pending', 'pending', 'pending'],
    onQuit: handleQuit,
    lessonId: originalLessonId, // Use original lessonId so book icon shows correct content
    totalQuestions: questions.length,
    isPracticeMode: true,
    practiceProgress: practiceProgress,
    isPersonalizedPractice: true
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
          backgroundColor: '#161d25',
          zIndex: 999999,
          opacity: isLoading ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: isLoading ? 'auto' : 'none'
        }}
      />
      
      {/* Progress indicator */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(22, 29, 37, 0.9)',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontFamily: "'Unbounded', sans-serif",
        fontSize: '14px',
        zIndex: 1000
      }}>
        Progress: {progressCount.toFixed(1)} / 5.0
      </div>

      {/* Render appropriate question component */}
      {currentQuestion.type === 'illustratedMCQ' && (
        <IllustratedMCQ key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
      )}
      {currentQuestion.type === 'mcq' && (
        <MCQ key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
      )}
      {currentQuestion.type === 'fillInTheBlank' && (
        <FillInTheBlank key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
      )}
      {currentQuestion.type === 'answerYourself' && (
        <AnswerYourself key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
      )}

      {/* Quit Modal */}
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
      
      {showQuitModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#161d25',
            borderRadius: '12px',
            padding: '32px',
            zIndex: 1000002,
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
          }}
        >
          <h3 style={{ 
            color: 'white', 
            fontSize: '20px', 
            fontWeight: 600, 
            fontFamily: "'Unbounded', sans-serif", 
            marginBottom: '16px' 
          }}>
            Are you sure?
          </h3>
          <p style={{ 
            color: 'white', 
            fontSize: '16px', 
            fontFamily: "'Inter Tight', sans-serif", 
            marginBottom: '24px' 
          }}>
            If you quit, your progress will be lost.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              onClick={handleQuitConfirm}
              style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: 'white',
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
                src={isContinueButtonPressed ? '/continuepressed.svg' : '/continue.svg'}
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

export default PersonalizedPractice
