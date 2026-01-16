import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import IllustratedMCQ from './IllustratedMCQ'
import MCQ from './MCQ'
import FillInTheBlank from './FillInTheBlank'
import AnswerYourself from './AnswerYourself'
import { recordAnswer } from '../utils/answerTracker'

const Transition = forwardRef(({ questions, onLessonComplete, onQuit, lessonId = 1, showContentButton = true, isReviewOrSkipQuiz = false, isLightMode = false }, ref) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [shouldShowNext, setShouldShowNext] = useState(false)
  const [isInTransition, setIsInTransition] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState([])
  const [lastThreeQuestions, setLastThreeQuestions] = useState(['pending', 'pending', 'pending'])
  const transitioningRef = useRef(false)
  const questionComponentRef = useRef(null)

  const currentQuestion = questions[currentQuestionIndex]

  // Expose debug methods via ref
  useImperativeHandle(ref, () => ({
    triggerCorrect: () => {
      if (questionComponentRef.current?.triggerCorrect) {
        questionComponentRef.current.triggerCorrect()
      }
    },
    triggerWrong: () => {
      if (questionComponentRef.current?.triggerWrong) {
        questionComponentRef.current.triggerWrong()
      }
    }
  }))

  const handleAnswerResult = (result) => {
    // Only process if this question not yet recorded
    setAnsweredQuestions(prev => {
      if (prev.includes(currentQuestionIndex)) return prev
      const next = [...prev, currentQuestionIndex]
      // Update counts
      if (result === 'correct') {
        setCorrectAnswersCount(c => c + 1)
      }
      setAnsweredCount(c => c + 1)

      // Track warned/wrong answers for personalized practice
      if (result === 'warned' || result === 'wrong') {
        // Fire and forget - don't await to avoid blocking UI
        recordAnswer(lessonId, currentQuestionIndex, result).catch(err => {
          console.error('Failed to record answer', err)
        })
      }

      // Update dots for questions 7-9 (indexes 6,7,8)
      if (currentQuestionIndex >= 6 && currentQuestionIndex <= 8) {
        const idx = currentQuestionIndex - 6
        setLastThreeQuestions(prevDots => {
          const updated = [...prevDots]
          updated[idx] = result === 'correct' ? 'correct' : 'wrong'
          return updated
        })
      }
      return next
    })
  }

  const handleCorrectAnswer = () => {
    handleAnswerResult('correct')
  }

  const handleContinue = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1
      
      // Phase 1: Old question scrolls up
      setIsTransitioning(true)
      setIsInTransition(true)
      
      // Phase 2: After old question scrolls up, prepare new question
      setTimeout(() => {
        // Set states for new question to appear below
        setIsTransitioning(false)
        setShouldShowNext(true)
        setIsInTransition(true)
        
        // Change question index - new component will mount
        setCurrentQuestionIndex(nextIndex)
        
        // Wait for component to mount and render
        // Use multiple requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Small delay to ensure component is fully rendered at bottom
            setTimeout(() => {
              // Now trigger animation by removing isInTransition
              setIsInTransition(false)
              
              // Clean up after animation
              setTimeout(() => {
                setShouldShowNext(false)
              }, 300)
            }, 50) // Give enough time for component to render at bottom
          })
        })
      }, 300)
    } else {
      setCurrentQuestionIndex(0)
      setCorrectAnswersCount(0)
      setAnsweredCount(0)
      setAnsweredQuestions([])
      setLastThreeQuestions(['pending', 'pending', 'pending'])
      if (onLessonComplete) {
        onLessonComplete()
      }
    }
  }

  // Reset when questions change
  useEffect(() => {
    setCurrentQuestionIndex(0)
    setCorrectAnswersCount(0)
    setAnsweredCount(0)
    setAnsweredQuestions([])
    setLastThreeQuestions(['pending', 'pending', 'pending'])
    setIsTransitioning(false)
    setIsInTransition(false)
    setShouldShowNext(false)
  }, [questions])

  if (!currentQuestion) {
    return <div>No questions available</div>
  }

  const commonProps = {
    onContinue: handleContinue,
    onCorrectAnswer: handleCorrectAnswer,
    onAnswerResult: handleAnswerResult,
    isInTransition,
    isTransitioning,
    shouldShowNext,
    questionData: currentQuestion,
    questionIndex: currentQuestionIndex,
    answeredCount,
    correctAnswersCount,
    lastThreeQuestions,
    onQuit,
    lessonId,
    totalQuestions: questions.length,
    showContentButton,
    isReviewOrSkipQuiz,
    isLightMode
  }

  // Render appropriate question component based on type
  switch (currentQuestion.type) {
    case 'illustratedMCQ':
      return <IllustratedMCQ key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
    case 'mcq':
      return <MCQ key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
    case 'fillInTheBlank':
      return <FillInTheBlank key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
    case 'answerYourself':
      return <AnswerYourself key={`q-${currentQuestionIndex}`} ref={questionComponentRef} {...commonProps} />
    default:
      return <div>Unknown question type: {currentQuestion.type}</div>
  }
})

export default Transition
