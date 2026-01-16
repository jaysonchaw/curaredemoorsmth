import { useState, useEffect, useRef, useLayoutEffect, useImperativeHandle, forwardRef } from 'react'
import { getLessonMetadata } from '../data/lessons/lessonLoader'
import LessonContent from '../components/LessonContent'

// Function to calculate time since last update
const getLastUpdatedText = (lastUpdatedTimestamp) => {
  const now = new Date()
  const lastUpdated = new Date(lastUpdatedTimestamp)
  const diffMs = now - lastUpdated
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffMonths = Math.floor(diffDays / 30)
  
  if (diffMins < 1) {
    return 'JUST NOW'
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'MINUTE' : 'MINUTES'} AGO`
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'HOUR' : 'HOURS'} AGO`
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'DAY' : 'DAYS'} AGO`
  } else {
    return `${diffMonths} ${diffMonths === 1 ? 'MONTH' : 'MONTHS'} AGO`
  }
}

const MCQ = forwardRef(({ onContinue, onCorrectAnswer, onAnswerResult, isInTransition, isTransitioning, shouldShowNext, questionData, questionIndex, correctAnswersCount = 0, answeredCount = 0, lastThreeQuestions = ['pending', 'pending', 'pending'], onQuit, lessonId = 1, totalQuestions = 9, isPracticeMode = false, practiceProgress = 0, showContentButton = true, isReviewOrSkipQuiz = false, isLightMode = false, isPersonalizedPractice = false }, ref) => {
  const contentRef = useRef(null)
  // Get lesson title from metadata
  const lessonMetadata = getLessonMetadata(lessonId)
  const lessonTitle = lessonMetadata?.title || `Lesson ${lessonId}`
  // Initialize option states from questionData
  const getInitialOptionStates = () => {
    if (questionData?.options) {
      return questionData.options.reduce((acc, opt) => {
        acc[opt.id] = 'default'
        return acc
      }, {})
    }
    return {}
  }
  
  const [selectedOption, setSelectedOption] = useState(null)
  const [questionState, setQuestionState] = useState('active') // 'active', 'warned', 'wrong', 'correct'
  // Reviews and skip quizzes: always 1 attempt. Regular lessons: First 6 questions get 2 attempts (lives = 2), rest get 1 attempt (lives = 1)
  const [lives, setLives] = useState(isReviewOrSkipQuiz ? 1 : (questionIndex < 6 ? 2 : 1))
  const [optionStates, setOptionStates] = useState(() => getInitialOptionStates())
  const [hoveredOption, setHoveredOption] = useState(null)
  const [hoveredIcon, setHoveredIcon] = useState(null) // 'book' or 'flag'
  const [isClinicianTextHovered, setIsClinicianTextHovered] = useState(false)
  const [isBookmarkSelected, setIsBookmarkSelected] = useState(false)
  const [isBookmarkHovered, setIsBookmarkHovered] = useState(false)
  const [isSourcesHovered, setIsSourcesHovered] = useState(false)
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false)
  const [isBookContentOpen, setIsBookContentOpen] = useState(false)
  const sourcesSectionRef = useRef(null)
  const bookModalContentRef = useRef(null)
  
  // Determine which sections to show based on questionIndex
  const showSectionA = true // Always show section A
  const showSectionB = questionIndex >= 3
  const showSectionC = questionIndex >= 6
  
  // Function to scroll to sources
  const scrollToSources = () => {
    if (sourcesSectionRef.current && bookModalContentRef.current) {
      const sourcesElement = sourcesSectionRef.current
      const modalContent = bookModalContentRef.current
      const sourcesTop = sourcesElement.offsetTop
      modalContent.scrollTo({
        top: sourcesTop - 20, // Add some padding
        behavior: 'smooth'
      })
    }
  }
  const [showGleamOverlay, setShowGleamOverlay] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const [hasReportedAnswer, setHasReportedAnswer] = useState(false)
  const [pressedOption, setPressedOption] = useState(null)
  const [isLightbulbHovered, setIsLightbulbHovered] = useState(false)
  const [flagReasons, setFlagReasons] = useState({
    inaccurate: false,
    harmful: false,
    technical: false,
    somethingElse: false
  })
  const [flagOtherText, setFlagOtherText] = useState('')
  
  // Track if we've forced initial position
  const hasForcedInitialPosition = useRef(false)
  
  // Force initial position on mount if transitioning
  useLayoutEffect(() => {
    if (contentRef.current && shouldShowNext && isInTransition && !hasForcedInitialPosition.current) {
      // CRITICAL: Force the element to be at translateY(100vh) immediately
      // This must happen before any paint
      const element = contentRef.current
      element.style.transform = 'translateY(100vh)'
      element.style.transition = 'none'
      // Force a reflow to ensure the style is applied
      element.offsetHeight
      hasForcedInitialPosition.current = true
    }
  }, [shouldShowNext, isInTransition])
  
  // Handle transition state changes
  useEffect(() => {
    if (contentRef.current && shouldShowNext && !isInTransition) {
      // Enable transition for animation up
      contentRef.current.style.transition = 'transform 0.3s ease-out'
      // Reset the forced position flag after animation starts
      setTimeout(() => {
        hasForcedInitialPosition.current = false
      }, 350)
    }
  }, [shouldShowNext, isInTransition])
  
  // Reset flag when question changes
  useEffect(() => {
    hasForcedInitialPosition.current = false
  }, [questionData?.id])

  // Expose debug methods via ref
  useImperativeHandle(ref, () => ({
    triggerCorrect: () => {
      if (questionState === 'active') {
        setQuestionState('correct')
        if (onCorrectAnswer) {
          onCorrectAnswer()
        }
        // Dispatch XP event: 2 XP for practice mode, 5 XP for personalized practice or regular lessons
        const xpAmount = (isPracticeMode && !isPersonalizedPractice) ? 2 : 5
        window.dispatchEvent(new CustomEvent('tsv2XPGained', { detail: { xp: xpAmount } }))
        setShowGleamOverlay(true)
        setTimeout(() => {
          setShowGleamOverlay(false)
        }, 480)
      }
    },
    triggerWrong: () => {
      if (questionState === 'active') {
        setQuestionState('wrong')
        setLives(0)
        if (selectedOption) {
          setOptionStates(prev => ({ ...prev, [selectedOption]: 'wrong' }))
        }
      }
    }
  }))

  const getMCQBoxImage = (state, isPressed, isHovered) => {
    const lightSuffix = isLightMode ? '(light)' : ''
    // If mouse is held down, show pressed state
    if (isPressed && questionState === 'active' && state === 'default') {
      return `/MCQboxpressed${lightSuffix}.svg`
    }
    // If hovering and in default state, show hover
    if (isHovered && state === 'default' && questionState === 'active') {
      return `/MCQboxhover${lightSuffix}.svg`
    }
    const stateMap = {
      'default': `MCQboxdefault${lightSuffix}.svg`,
      'selected': `MCQboxselected${lightSuffix}.svg`,
      'correct': `MCQboxcorrect${lightSuffix}.svg`,
      'warned': `MCQboxwarned${lightSuffix}.svg`,
      'wrong': `MCQboxwrong${lightSuffix}.svg`
    }
    return `/${stateMap[state] || `MCQboxdefault${lightSuffix}.svg`}`
  }

  const handleOptionClick = (optionId) => {
    try {
      if (questionState !== 'active') return
      // Don't allow pressing if this option is already selected
      if (selectedOption === optionId) return
      if (optionStates[optionId] === 'selected') return

      // Brief pressed state
      setOptionStates(prev => {
        if (!prev) return { [optionId]: 'pressed' }
        return { ...prev, [optionId]: 'pressed' }
      })
      
      setTimeout(() => {
        setOptionStates(prev => {
          // Reset all options to default, then set selected one
          const newStates = {}
          if (questionData?.options) {
            questionData.options.forEach(opt => {
              newStates[opt.id] = 'default'
            })
          }
          newStates[optionId] = 'selected'
          return newStates
        })
        setSelectedOption(optionId)
      }, 100)
    } catch (error) {
      console.error('Error in handleOptionClick:', error)
    }
  }

  const handleSubmit = () => {
    if (!selectedOption || questionState !== 'active') return

    const correctAnswer = questionData?.correctAnswer
    if (selectedOption === correctAnswer) {
      setOptionStates(prev => ({ ...prev, [selectedOption]: 'correct' }))
      setQuestionState('correct')
      if (!hasReportedAnswer) {
        if (onAnswerResult) onAnswerResult('correct')
        if (onCorrectAnswer) onCorrectAnswer()
        // Dispatch XP event: 2 XP for practice mode, 5 XP for personalized practice or regular lessons
        const xpAmount = (isPracticeMode && !isPersonalizedPractice) ? 2 : 5
        window.dispatchEvent(new CustomEvent('tsv2XPGained', { detail: { xp: xpAmount } }))
        setHasReportedAnswer(true)
      }
      setShowGleamOverlay(true)
      setTimeout(() => {
        setShowGleamOverlay(false)
      }, 480)
    } else {
      // Reviews and skip quizzes: no warned state, go straight to wrong
      if (isReviewOrSkipQuiz || lives === 1) {
        setOptionStates(prev => ({ ...prev, [selectedOption]: 'wrong' }))
        setQuestionState('wrong')
        setLives(0)
        if (!hasReportedAnswer) {
          if (onAnswerResult) onAnswerResult('wrong')
          setHasReportedAnswer(true)
        }
      } else {
        // Regular lessons: first wrong answer shows warned state
        setOptionStates(prev => ({ ...prev, [selectedOption]: 'warned' }))
        setQuestionState('warned')
        setLives(1)
      }
    }
  }

  const handleUnderstood = () => {
    if (questionState === 'warned') {
      const warnedOption = selectedOption
      setOptionStates(prev => ({ ...prev, [warnedOption]: 'default' }))
      setQuestionState('active')
      setSelectedOption(null)
    }
  }

  const handleContinue = () => {
    setShowGleamOverlay(false)
    // If onContinue prop exists (from Transition), call it instead of resetting
    if (onContinue && (questionState === 'correct' || questionState === 'wrong')) {
      onContinue()
      return
    }
    // Reset question (for standalone use)
    setOptionStates(getInitialOptionStates())
    setQuestionState('active')
    setSelectedOption(null)
    setHasReportedAnswer(false)
    // Reviews and skip quizzes: always 1 attempt. Regular lessons: First 6 questions get 2 attempts, rest get 1 attempt
    setLives(isReviewOrSkipQuiz ? 1 : (questionIndex < 6 ? 2 : 1))
  }

  const handleFlagClick = () => {
    setIsFlagModalOpen(true)
  }

  const handleFlagClose = () => {
    setIsFlagModalOpen(false)
    setFlagReasons({
      inaccurate: false,
      harmful: false,
      technical: false,
      somethingElse: false
    })
    setFlagOtherText('')
  }

  const handleFlagReasonChange = (reason) => {
    setFlagReasons(prev => ({
      ...prev,
      [reason]: !prev[reason]
    }))
  }

  const handleFlagSubmit = () => {
    // Track flagged question if analytics enabled
    if (flagReasons.inaccurate || flagReasons.harmful || flagReasons.technical || flagReasons.somethingElse) {
      const reasons = []
      if (flagReasons.inaccurate) reasons.push('inaccurate')
      if (flagReasons.harmful) reasons.push('harmful')
      if (flagReasons.technical) reasons.push('technical')
      if (flagReasons.somethingElse) reasons.push('somethingElse')
      
      // Import and track
      import('../utils/analyticsTracker').then(({ trackFlaggedQuestion }) => {
        trackFlaggedQuestion(lessonId, questionIndex, reasons.join(', '))
      }).catch(() => {
        // Silently fail if analytics not available
      })
    }
    
    handleFlagClose()
  }

  const handleBookClick = () => {
    setIsBookContentOpen(!isBookContentOpen)
  }

  // Load bookmark state from localStorage on mount and when lessonId changes
  useEffect(() => {
    const bookmarkKey = `bookmark_lesson_${lessonId}`
    const savedBookmark = localStorage.getItem(bookmarkKey)
    if (savedBookmark === 'true') {
      setIsBookmarkSelected(true)
    }
  }, [lessonId])

  // Save bookmark state to localStorage when it changes
  useEffect(() => {
    const bookmarkKey = `bookmark_lesson_${lessonId}`
    if (isBookmarkSelected) {
      localStorage.setItem(bookmarkKey, 'true')
    } else {
      localStorage.removeItem(bookmarkKey)
    }
  }, [isBookmarkSelected, lessonId])

  // Reset state when questionData changes
  useEffect(() => {
    if (questionData?.options) {
      const newOptionStates = questionData.options.reduce((acc, opt) => {
        acc[opt.id] = 'default'
        return acc
      }, {})
      setOptionStates(newOptionStates)
      setSelectedOption(null)
      setQuestionState('active')
      // Reviews and skip quizzes: always 1 attempt. Regular lessons: First 6 questions get 2 attempts, rest get 1 attempt
      setLives(isReviewOrSkipQuiz ? 1 : (questionIndex < 6 ? 2 : 1))
      setShowGleamOverlay(false)
      setPressedOption(null)
      setHoveredOption(null)
      setHasReportedAnswer(false)
    }
  }, [questionData?.id, questionData?.options, questionIndex])

  const handleBookModalClose = () => {
    setIsBookContentOpen(false)
  }

  const isOptionInteractable = questionState === 'active'
  const canSubmit = selectedOption !== null && questionState === 'active'

  const getSubmitButtonImage = () => {
    const pressed = isButtonPressed ? 'pressed' : ''
    const lightSuffix = isLightMode ? '(light)' : ''
    let path = ''
    if (questionState === 'active') {
      if (!canSubmit) {
        path = `/submitunselected${pressed}${lightSuffix}.svg`
      } else {
        path = `/submitselected${pressed}${lightSuffix}.svg`
      }
    } else if (questionState === 'warned') {
      path = `/submitwarned${pressed}${lightSuffix}.svg`
    } else if (questionState === 'wrong') {
      path = `/submitwrong${pressed}${lightSuffix}.svg`
    } else if (questionState === 'correct') {
      path = `/submitselected${pressed}${lightSuffix}.svg`
    } else {
      path = `/submitunselected${pressed}${lightSuffix}.svg`
    }
    return path
  }

  const getContinueButtonImage = () => {
    const pressed = isButtonPressed ? 'pressed' : ''
    const lightSuffix = isLightMode ? '(light)' : ''
    return `/submitcorrect${pressed}${lightSuffix}.svg`
  }

  const getDuplicateButtonImage = () => {
    const pressed = isButtonPressed ? 'pressed' : ''
    const lightSuffix = isLightMode ? '(light)' : ''
    return `/submitcorrect${pressed}(new)${lightSuffix}.svg`
  }

  // Calculate progress bar width
  let progressWidth
  if (isPracticeMode) {
    // Practice mode: use practiceProgress (0-1) converted to percentage
    progressWidth = Math.min(practiceProgress * 100, 100)
  } else if (isReviewOrSkipQuiz) {
    // Review/Skip quiz mode: based on answered count / total questions (updates smoothly as questions are answered)
    progressWidth = (answeredCount / totalQuestions) * 100
  } else {
    // Regular lesson mode: based on question index (progresses regardless of correctness)
    const primaryTotal = 6
    const answeredPrimary = Math.min(answeredCount, primaryTotal)
    progressWidth = (answeredPrimary / primaryTotal) * 100
  }

  return (
    <div style={{ backgroundColor: isLightMode ? '#ffffff' : '#161d25', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Darkening Overlay - Flag Modal */}
      <div
        onClick={handleFlagClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isFlagModalOpen ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
          transition: 'background-color 0.4s ease',
          zIndex: 1000001,
          pointerEvents: isFlagModalOpen ? 'auto' : 'none'
        }}
      />

      {/* Darkening Overlay - Book Modal */}
      <div
        onClick={handleBookModalClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isBookContentOpen ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
          transition: 'background-color 0.4s ease',
          zIndex: 1000001,
          pointerEvents: isBookContentOpen ? 'auto' : 'none'
        }}
      />

      {/* Book Modal Panel */}
      {isBookContentOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '45vw',
            maxWidth: '500px',
            aspectRatio: '3 / 4',
            backgroundColor: isLightMode ? '#ffffff' : '#161d25',
            borderRadius: '12px',
            zIndex: 1000003,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            isolation: 'isolate',
            padding: '32px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <div
            ref={bookModalContentRef}
            className="book-modal-content"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingRight: '0'
            }}
          >
          <button
            onClick={handleBookModalClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: isLightMode ? '#000000' : 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              zIndex: 1
            }}
          >
            ×
          </button>
          <div style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : 'white',
            textTransform: 'uppercase',
            marginBottom: '16px',
            letterSpacing: '0.5px'
          }}>
            LESSON {lessonId}   |   LAST UPDATED {getLastUpdatedText(new Date(Date.now() - 2 * 60 * 60 * 1000))}
          </div>
          <h1 style={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : 'white',
            margin: 0,
            marginBottom: '8px',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'space-between'
          }}>
            {lessonTitle}
            <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0, marginTop: '4px', marginLeft: '16px' }}>
              <img
                src={
                  isBookmarkSelected
                    ? (isBookmarkHovered 
                        ? `/bookmarkfilledhover${isLightMode ? '(light)' : ''}.png`
                        : `/bookmarkfilled${isLightMode ? '(light)' : ''}.png`)
                    : (isBookmarkHovered 
                        ? `/bookmarkhover${isLightMode ? '(light)' : ''}.png`
                        : `/bookmark${isLightMode ? '(light)' : ''}.png`)
                }
                alt="Bookmark"
                onMouseEnter={() => setIsBookmarkHovered(true)}
                onMouseLeave={() => setIsBookmarkHovered(false)}
                onClick={() => setIsBookmarkSelected(!isBookmarkSelected)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
              <img
                src={`/sources${isSourcesHovered ? 'hover' : ''}${isLightMode ? '(light)' : ''}.png`}
                alt="Sources"
                onMouseEnter={() => setIsSourcesHovered(true)}
                onMouseLeave={() => setIsSourcesHovered(false)}
                onClick={scrollToSources}
                style={{
                  position: 'absolute',
                  top: '26px',
                  left: '0',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </div>
          </h1>
          <div
            onMouseEnter={() => setIsClinicianTextHovered(true)}
            onMouseLeave={() => setIsClinicianTextHovered(false)}
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: isClinicianTextHovered ? '#2563eb' : (isLightMode ? '#000000' : 'white'),
              transition: 'color 0.2s ease',
              cursor: 'pointer',
              display: 'inline-block',
              width: 'fit-content'
            }}
          >
            Clinician Reviewed Content ⓘ
          </div>
          <div
            style={{
              width: 'calc(100% - 0px)',
              height: '1px',
              backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
              marginTop: '16px',
              marginLeft: '0',
              marginRight: '0',
              marginBottom: '0'
            }}
          />
          <LessonContent lessonId={lessonId} sourcesSectionRef={sourcesSectionRef} isLightMode={isLightMode} />
          </div>
          {/* Top fade overlay */}
          <div
            style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              right: '0px',
              height: '60px',
              background: isLightMode 
                ? 'linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0) 100%)'
                : 'linear-gradient(to bottom, rgba(22, 29, 37, 1) 0%, rgba(22, 29, 37, 0.8) 30%, rgba(22, 29, 37, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />
          {/* Bottom fade overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              right: '0px',
              height: '60px',
              background: isLightMode
                ? 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 30%, rgba(255, 255, 255, 0) 100%)'
                : 'linear-gradient(to top, rgba(22, 29, 37, 1) 0%, rgba(22, 29, 37, 0.8) 30%, rgba(22, 29, 37, 0) 100%)',
              pointerEvents: 'none',
              zIndex: 1000
            }}
          />
        </div>
      )}

      {/* Flag Modal Panel */}
      {isFlagModalOpen && (
        <div
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: isLightMode ? '#000000' : 'white', fontSize: '20px', fontWeight: 600, fontFamily: "'Unbounded', sans-serif" }}>
              Report Content
            </h3>
            <button
              onClick={handleFlagClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: isLightMode ? '#000000' : 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#999'}
              onMouseLeave={(e) => e.target.style.color = isLightMode ? '#000000' : 'white'}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={flagReasons.inaccurate}
                onChange={() => handleFlagReasonChange('inaccurate')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: isLightMode ? '#000000' : 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
                This content is inaccurate/misleading
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={flagReasons.harmful}
                onChange={() => handleFlagReasonChange('harmful')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: isLightMode ? '#000000' : 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
                This content promotes harm or is inappropriate
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={flagReasons.technical}
                onChange={() => handleFlagReasonChange('technical')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
                Technical errors (e.g., parts of the question not loading)
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={flagReasons.somethingElse}
                onChange={() => handleFlagReasonChange('somethingElse')}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
                Something else
              </span>
            </label>
          </div>

          {flagReasons.somethingElse && (
            <textarea
              value={flagOtherText}
              onChange={(e) => setFlagOtherText(e.target.value)}
              placeholder="Please describe the issue..."
              style={{
                width: '100%',
                minHeight: '100px',
                backgroundColor: '#29323c',
                color: isLightMode ? '#000000' : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: "'Inter Tight', sans-serif",
                resize: 'vertical',
                marginBottom: '24px',
                outline: 'none'
              }}
            />
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleFlagSubmit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: isLightMode ? '#000000' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 500,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Submit
            </button>
          </div>
        </div>
      )}
      
      {/* Back Button */}
      <button
        onClick={onQuit}
        className="absolute p-2"
        style={{ 
          fontSize: '24px', 
          zIndex: 10000, 
          position: 'fixed', 
          top: '20px', 
          left: '60px',
          color: isLightMode ? '#000000' : 'white',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = isLightMode ? '#333333' : '#d1d5db'}
        onMouseLeave={(e) => e.target.style.color = isLightMode ? '#000000' : 'white'}
      >
        ←
      </button>

      {/* Top Box */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        zIndex: 1000
      }} />

      {/* Progress Bar at top */}
      <div style={{
        position: 'fixed',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: (isPracticeMode || isReviewOrSkipQuiz) ? 'auto' : 'calc(100% - 64px)',
        maxWidth: (isPracticeMode || isReviewOrSkipQuiz) ? '800px' : '800px',
        justifyContent: (isPracticeMode || isReviewOrSkipQuiz) ? 'center' : 'flex-start'
      }}>
        {/* Main progress bar */}
        <div style={{
          flex: (isPracticeMode || isReviewOrSkipQuiz) ? '0 0 auto' : 1,
          width: (isPracticeMode || isReviewOrSkipQuiz) ? '800px' : 'auto',
          maxWidth: '800px',
          height: '8px',
          backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            width: `${progressWidth}%`,
            height: '100%',
            backgroundColor: '#2563eb',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        {/* Last 3 questions indicators - only show for regular lessons (not practice, review, or skip quiz) */}
        {!isPracticeMode && !isReviewOrSkipQuiz && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {lastThreeQuestions.map((status, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: status === 'correct' ? '#2563eb' : status === 'wrong' ? '#f73d35' : (isLightMode ? '#d0d1d2' : '#3b4652'),
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shadow at top */}
      <div style={{
        width: '100%',
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent)',
        position: 'fixed',
        top: '80px',
        left: 0,
        zIndex: 1000,
        pointerEvents: 'none'
      }} />

      {/* Question Content - Scroll animation */}
      <div
        ref={contentRef}
        style={{
          transform: isTransitioning 
            ? 'translateY(-100vh)' 
            : shouldShowNext && isInTransition
            ? 'translateY(100vh)' 
            : shouldShowNext && !isInTransition
            ? 'translateY(0)'
            : 'translateY(0)',
          transition: (isTransitioning || (shouldShowNext && !isInTransition)) ? 'transform 0.3s ease-out' : 'none',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          paddingBottom: '120px'
        }}
      >
        {/* Question Text and Icons */}
        <div className="pt-32 pb-12" style={{ paddingTop: 'calc(8rem + 40px)' }}>
          <div className="flex justify-center px-8">
            <div className="flex items-center" style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
              <h2
                className="text-base md:text-lg text-left"
                style={{ 
                  fontFamily: "'Unbounded', sans-serif", 
                  fontWeight: 500, 
                  lineHeight: '1.5',
                  paddingRight: '100px',
                  color: isLightMode ? '#000000' : 'white'
                }}
              >
                {questionData?.question || 'Select the correct answer'}
              </h2>
              {/* Icons container */}
              <div className="flex items-center gap-4" style={{ position: 'absolute', right: '0px' }}>
                {showContentButton && (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={hoveredIcon === 'book' 
                        ? (isLightMode ? '/lighthover1.png' : '/book-alt (1) (hover).png')
                        : (isLightMode ? '/book-alt (1)(light).png' : '/book-alt (1).png')} 
                      alt="Book" 
                      style={{ 
                        cursor: 'pointer', 
                        position: 'relative', 
                        zIndex: 1, 
                        width: '24px', 
                        height: '24px',
                        opacity: hoveredIcon === 'book' ? 0.7 : 1,
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={() => setHoveredIcon('book')}
                      onMouseLeave={() => setHoveredIcon(null)}
                      onClick={handleBookClick}
                      onError={(e) => {
                        // Fallback to normal image if hover image doesn't exist
                        e.target.src = isLightMode ? '/book-alt (1)(light).png' : '/book-alt (1).png'
                      }}
                    />
                  </div>
                )}
                <img 
                  src={hoveredIcon === 'flag' 
                    ? (isLightMode ? '/lighthover2.png' : '/finish-flag(hover).png')
                    : (isLightMode ? '/finish-flag(light).png' : '/finish-flag.png')} 
                  alt="Flag" 
                  style={{ cursor: 'pointer', width: '24px', height: '24px' }}
                  onMouseEnter={() => setHoveredIcon('flag')}
                  onMouseLeave={() => setHoveredIcon(null)}
                  onClick={handleFlagClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Options - Using MCQbox assets */}
        <div className="flex flex-col justify-center items-center gap-4 px-8" style={{ minHeight: '200px', paddingTop: '0px', paddingBottom: '40px' }}>
          {!questionData ? (
            <div style={{ color: isLightMode ? '#000000' : 'white' }}>Loading question data...</div>
          ) : !questionData.options || questionData.options.length === 0 ? (
            <div style={{ color: isLightMode ? '#000000' : 'white' }}>No options available</div>
          ) : (
            questionData.options.map((option) => {
              const optionId = option.id
              const currentState = optionStates[optionId] || 'default'
              const isPressed = pressedOption === optionId
              const isHovered = hoveredOption === optionId
              
              return (
                <div
                  key={optionId}
                  style={{
                    position: 'relative',
                    width: '533.33px',
                    cursor: (isOptionInteractable && selectedOption !== optionId && currentState !== 'selected') ? 'pointer' : 'default'
                  }}
                  onMouseDown={() => {
                    if (selectedOption === optionId || currentState === 'selected') return
                    if (questionState === 'active' && isOptionInteractable) {
                      setPressedOption(optionId)
                    }
                  }}
                  onMouseUp={() => {
                    setPressedOption(null)
                  }}
                  onMouseLeave={() => {
                    if (hoveredOption === optionId) {
                      setHoveredOption(null)
                    }
                    setPressedOption(null)
                  }}
                  onMouseEnter={() => {
                    if (questionState === 'active' && currentState === 'default') {
                      setHoveredOption(optionId)
                    }
                  }}
                  onClick={(e) => {
                    if (selectedOption === optionId || currentState === 'selected') {
                      e.preventDefault()
                      e.stopPropagation()
                      return
                    }
                    handleOptionClick(optionId)
                  }}
                >
                  <img
                    src={getMCQBoxImage(currentState, isPressed, isHovered)}
                    alt="Option"
                    draggable="false"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none'
                    }}
                  />
                  {/* Text centered on box, moved up, moves down when pressed */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, ${isPressed ? 'calc(-50% + 2px)' : 'calc(-50% - 2px)'})`,
                      color: isLightMode ? '#000000' : 'white',
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '16px',
                      fontWeight: 500,
                      textAlign: 'center',
                      pointerEvents: 'none',
                      transition: 'transform 0.1s ease',
                      width: 'calc(100% - 48px)'
                    }}
                  >
                    {option.label}
                  </div>
                  {/* GIF Overlay - only on correct option */}
                  {showGleamOverlay && currentState === 'correct' && (
                    <img
                      src="/theworkinggif.gif"
                      alt="Gleam"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '533.33px',
                        height: 'auto',
                        pointerEvents: 'none',
                        objectFit: 'contain',
                        zIndex: 1
                      }}
                    />
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bottom Box - Always present, behind question content */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        zIndex: 50
      }} />

      {/* Background fill when correct */}
      <div style={{
        width: '100%',
        height: questionState === 'correct' ? (isTransitioning ? '0px' : '120px') : '0px',
        backgroundColor: isLightMode ? '#caffb5ff' : '#1f5d07',
        position: 'fixed',
        bottom: 0,
        left: 0,
        zIndex: questionState === 'correct' ? 60 : 0,
        transition: 'height 0.2s ease-out',
        overflow: 'hidden'
      }} />

      {/* Line between question and buttons */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: questionState === 'correct' && !isTransitioning ? '#51de18' : (isLightMode ? '#d0d1d2' : '#3b4652'),
        position: 'fixed',
        bottom: '120px',
        left: 0,
        zIndex: 100,
        transition: 'background-color 0.2s ease-out'
      }} />

      {/* Original Button - Always Centered, Behind Green Box when correct */}
      <div className="flex justify-center" style={{ 
        position: 'fixed', 
        bottom: '32px', 
        left: '50%',
        transform: 'translateX(-50%)', 
        zIndex: questionState === 'correct' ? 1 : 1000, 
        width: '100%'
      }}>
        {questionState === 'active' && (
          <button
            onClick={handleSubmit}
            onMouseDown={() => setIsButtonPressed(true)}
            onMouseUp={() => setIsButtonPressed(false)}
            onMouseLeave={() => setIsButtonPressed(false)}
            disabled={!canSubmit}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: 1,
              display: 'block',
              width: '133px',
              height: '67px'
            }}
          >
            <img
              src={getSubmitButtonImage()}
              alt="Submit"
              draggable="false"
              style={{ 
                display: 'block',
                width: '133px',
                height: '67px',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none'
              }}
            />
          </button>
        )}

        {questionState === 'warned' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleUnderstood}
              onMouseDown={() => setIsButtonPressed(true)}
              onMouseUp={() => setIsButtonPressed(false)}
              onMouseLeave={() => setIsButtonPressed(false)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                width: '133px',
                height: '67px'
              }}
            >
              <img
                src={getSubmitButtonImage()}
                alt="Understood"
                draggable="false"
                style={{ 
                  display: 'block',
                  width: '133px',
                  height: '67px',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none'
                }}
              />
            </button>
            <img
              src={isLightbulbHovered ? "/lightbulb-question-hover.png" : "/lightbulb-question.png"}
              alt="Hint"
              onMouseEnter={() => setIsLightbulbHovered(true)}
              onMouseLeave={() => setIsLightbulbHovered(false)}
              style={{
                cursor: 'pointer',
                display: 'block',
                width: '24px',
                height: '24px'
              }}
            />
          </div>
        )}
      </div>

      {/* Continue Button - Inside green box when correct, far right */}
      {(questionState === 'wrong' || questionState === 'correct') && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          position: 'fixed',
          bottom: questionState === 'correct' ? '32px' : '32px', // Inside green box (at bottom of box)
          right: questionState === 'correct' ? '32px' : '32px', // Far right inside green box
          zIndex: 70,
          transition: questionState === 'correct' ? 'bottom 0.2s ease-out, right 0.2s ease-out' : 'none'
        }}>
          <button
            onClick={handleContinue}
            onMouseDown={() => setIsButtonPressed(true)}
            onMouseUp={() => setIsButtonPressed(false)}
            onMouseLeave={() => setIsButtonPressed(false)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              width: '133px',
              height: '67px'
            }}
          >
            <img
              src={getContinueButtonImage()}
              alt="Continue"
              draggable="false"
              style={{ 
                display: 'block',
                width: '133px',
                height: '67px',
                objectFit: 'contain',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none'
              }}
            />
          </button>
          {questionState === 'wrong' && (
            <img
              src={isLightbulbHovered ? "/lightbulb-question-hover.png" : "/lightbulb-question.png"}
              alt="Hint"
              onMouseEnter={() => setIsLightbulbHovered(true)}
              onMouseLeave={() => setIsLightbulbHovered(false)}
              style={{
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'block'
              }}
            />
          )}
        </div>
      )}

      {/* Correct Text - Centered inside green box */}
      {questionState === 'correct' && !isTransitioning && (
        <div style={{ 
          position: 'fixed', 
          bottom: '50px', // Slightly lower for better visual centering
          left: '50%',
          transform: 'translateX(-50%)', // Horizontally centered
          zIndex: 70,
          animation: 'slideUpWithBoxCenteredText 0.167s ease-out forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: "'Unbounded', sans-serif"
        }}>
          <span style={{ color: isLightMode ? '#000000' : '#ffffff', fontSize: '24px', fontWeight: 600 }}>Correct!</span>
          <span style={{ color: '#51de18', fontSize: '22px', fontWeight: 600, fontFamily: "'Inter Tight', sans-serif" }}>
            +{isPracticeMode && !isPersonalizedPractice ? '2' : '5'}xp
          </span>
        </div>
      )}

    </div>
  )
})

export default MCQ
