import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import IllustratedMCQ from './IllustratedMCQ'
import MCQ from './MCQ'
import FillInTheBlank from './FillInTheBlank'
import AnswerYourself from './AnswerYourself'
import { getLessonPracticeQuestions } from '../utils/lessonPractice'
import { recordAnswer } from '../utils/answerTracker'

const LessonPractice = () => {
  const navigate = useNavigate()
  const { lessonId } = useParams()
  const lessonIdNum = parseInt(lessonId, 10)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [isContinueButtonPressed, setIsContinueButtonPressed] = useState(false)
  
  // State for managing practice
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shouldShowNext, setShouldShowNext] = useState(false)
  const [isInTransition, setIsInTransition] = useState(false)
  const [practiceProgress, setPracticeProgress] = useState(0) // Progress for progress bar (0-1)
  const [questionResults, setQuestionResults] = useState({}) // Track results per question index
  const questionComponentRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize practice questions
  useEffect(() => {
    setIsLoading(true)
    const loadQuestions = async () => {
      const practiceQuestions = await getLessonPracticeQuestions(lessonIdNum, 6)
      
      if (practiceQuestions.length === 0) {
        alert('No questions available for practice.')
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
  }, [lessonIdNum, navigate])

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
    }

    // Update practice progress bar
    // Correct: fill 1/6 of the bar
    // Warned: fill 1/12 of the bar
    // Wrong: don't fill at all
    if (result === 'correct') {
      setPracticeProgress(prev => Math.min(prev + (1 / 6), 1))
    } else if (result === 'warned') {
      setPracticeProgress(prev => Math.min(prev + (1 / 12), 1))
    }
    // Wrong doesn't advance progress (0 for progress bar)
  }

  const handleCorrectAnswer = () => {
    handleAnswerResult('correct')
  }

  const handleContinue = () => {
    // Move to next question or complete
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
      // Practice complete - navigate back
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
  // If no metadata, fall back to the practice lessonId (for questions from the same lesson)
  const originalLessonId = currentQuestion._practiceMeta?.lessonId || lessonIdNum

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
    isPersonalizedPractice: false
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
        Question {currentQuestionIndex + 1} / {questions.length}
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

export default LessonPractice

