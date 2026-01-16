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

const IllustratedMCQ = forwardRef(({ onContinue, onCorrectAnswer, onAnswerResult, isInTransition, isTransitioning, shouldShowNext, questionData, questionIndex, correctAnswersCount = 0, answeredCount = 0, lastThreeQuestions = ['pending', 'pending', 'pending'], onQuit, lessonId = 1, totalQuestions = 9, isPracticeMode = false, practiceProgress = 0, showContentButton = true, isReviewOrSkipQuiz = false, isLightMode = false, isPersonalizedPractice = false }, ref) => {
  const contentRef = useRef(null)
  
  // Calculate transform based on current state
  const getTransform = () => {
    if (isTransitioning) {
      return 'translateY(-100vh)'
    }
    if (shouldShowNext && isInTransition) {
      return 'translateY(100vh)'
    }
    return 'translateY(0)'
  }
  
  const getTransition = () => {
    if (isTransitioning || (shouldShowNext && !isInTransition)) {
      return 'transform 0.3s ease-out'
    }
    return 'none'
  }
  
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
        if (selectedCard) {
          setCardStates(prev => ({ ...prev, [selectedCard]: 'wrong' }))
        }
      }
    }
  }))
  // Initialize card states from questionData
  const getInitialCardStates = () => {
    if (questionData?.options) {
      return questionData.options.reduce((acc, opt) => {
        acc[opt.id] = 'default'
        return acc
      }, {})
    }
    return { bone: 'default', muscle: 'default', heart: 'default' }
  }
  
  const [selectedCard, setSelectedCard] = useState(null)
  const [questionState, setQuestionState] = useState('active') // 'active', 'warned', 'wrong', 'correct'
  // Reviews and skip quizzes: always 1 attempt. Regular lessons: First 6 questions get 2 attempts (lives = 2), rest get 1 attempt (lives = 1)
  const [lives, setLives] = useState(isReviewOrSkipQuiz ? 1 : (questionIndex < 6 ? 2 : 1))
  const [cardStates, setCardStates] = useState(() => getInitialCardStates())
  const [hoveredCard, setHoveredCard] = useState(null)
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
  const [pressedCard, setPressedCard] = useState(null)
  const [isLightbulbHovered, setIsLightbulbHovered] = useState(false)
  const [flagReasons, setFlagReasons] = useState({
    inaccurate: false,
    harmful: false,
    technical: false,
    somethingElse: false
  })
  const [flagOtherText, setFlagOtherText] = useState('')
  const [hasReportedAnswer, setHasReportedAnswer] = useState(false)

  const getCardImage = (cardType, state) => {
    // Append "(light)" to filename if light mode is on
    const lightSuffix = isLightMode ? '(light)' : ''
    
    // If mouse is held down, show pressed state
    if (pressedCard === cardType && questionState === 'active') {
      return `/${cardType}pressed${lightSuffix}.svg`
    }
    // If hovering and in default state, show hover
    if (hoveredCard === cardType && state === 'default' && questionState === 'active') {
      return `/${cardType}hover${lightSuffix}.svg`
    }
    const stateMap = {
      'default': 'default',
      'pressed': 'pressed',
      'selected': 'selected',
      'warned': 'warned',
      'wrong': 'wrong',
      'correct': 'correct'
    }
    const imagePath = `/${cardType}${stateMap[state] || 'default'}${lightSuffix}.svg`
    return imagePath
  }

  const handleCardClick = (cardType) => {
    try {
    if (questionState !== 'active') return
    // Don't allow pressing if this card is already selected
      if (selectedCard === cardType) return
      if (cardStates[cardType] === 'selected') return

    // Brief pressed state
      setCardStates(prev => {
        if (!prev) return { [cardType]: 'pressed' }
        return { ...prev, [cardType]: 'pressed' }
      })
    
    setTimeout(() => {
      setCardStates(prev => {
          // Reset all cards to default, then set selected one
          const newStates = {}
          if (questionData?.options) {
            questionData.options.forEach(opt => {
              newStates[opt.id] = 'default'
            })
          } else {
            // Fallback
            newStates['bone'] = 'default'
            newStates['muscle'] = 'default'
            newStates['heart'] = 'default'
          }
        newStates[cardType] = 'selected'
        return newStates
      })
      setSelectedCard(cardType)
    }, 100)
    } catch (error) {
      console.error('Error in handleCardClick:', error)
    }
  }

  const handleSubmit = () => {
    if (!selectedCard || questionState !== 'active') return

    const correctAnswer = questionData?.correctAnswer || 'bone'
    if (selectedCard === correctAnswer) {
      setCardStates(prev => ({ ...prev, [selectedCard]: 'correct' }))
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
        setCardStates(prev => ({ ...prev, [selectedCard]: 'wrong' }))
        setQuestionState('wrong')
        setLives(0)
        if (!hasReportedAnswer) {
          if (onAnswerResult) onAnswerResult('wrong')
          setHasReportedAnswer(true)
        }
      } else {
        // Regular lessons: first wrong answer shows warned state
        setCardStates(prev => ({ ...prev, [selectedCard]: 'warned' }))
        setQuestionState('warned')
        setLives(1)
      }
    }
  }

  const handleUnderstood = () => {
    if (questionState === 'warned') {
      const warnedCard = selectedCard
      setCardStates(prev => ({ ...prev, [warnedCard]: 'default' }))
      setQuestionState('active')
      setSelectedCard(null)
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
    setCardStates(getInitialCardStates())
    setQuestionState('active')
    setSelectedCard(null)
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
      const newCardStates = questionData.options.reduce((acc, opt) => {
        acc[opt.id] = 'default'
        return acc
      }, {})
      setCardStates(newCardStates)
      setSelectedCard(null)
      setQuestionState('active')
      // Reviews and skip quizzes: always 1 attempt. Regular lessons: First 6 questions get 2 attempts, rest get 1 attempt
      setLives(isReviewOrSkipQuiz ? 1 : (questionIndex < 6 ? 2 : 1))
      setShowGleamOverlay(false)
      setPressedCard(null)
      setHoveredCard(null)
      setHasReportedAnswer(false)
    } else {
      // Fallback if questionData is not available yet
      setCardStates({ bone: 'default', muscle: 'default', heart: 'default' })
    }
  }, [questionData?.id, questionData?.options])


  const handleBookModalClose = () => {
    setIsBookContentOpen(false)
  }

  // Get lesson metadata for dynamic content
  const lessonMetadata = getLessonMetadata(lessonId)
  const lessonTitle = lessonMetadata?.title || 'Lesson'

  const isCardInteractable = questionState === 'active'
  const canSubmit = selectedCard !== null && questionState === 'active'

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
      // Original button stays as submitselected when correct
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
    // Regular lesson mode: based on answered questions (first 6 fill bar)
    const primaryTotal = 6
    const answeredPrimary = Math.min(answeredCount || 0, primaryTotal)
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
          {/* Old lesson content blocks removed - now using LessonContent component */}
          {false && lessonId === 1 ? (
            <>
              {/* Section A - Always visible */}
              <div style={{ position: 'relative' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  The human body is made of many parts (bones, muscles, heart, lungs, brain, stomach, etc.), each in a system with a special role. These systems must work together. Each system (like skeletal, muscular, circulatory, respiratory, nervous) has a main job, and health depends on them cooperating.
                </p>
                <img
                  src="/lesson1image1.webp"
                  alt="Lesson 1"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Figure 1.1: Anatomical rendering of the human torso, the lungs and heart shown in warm relief
                </p>
              </div>
              
              {/* Section B - Always visible */}
              <div style={{ position: 'relative', marginTop: '20px' }}>
                <ul style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  <li style={{ marginBottom: '12px' }}>
                    Major body systems include skeletal (bones), muscular (muscles), circulatory (heart/vessels), respiratory (lungs), nervous (brain/nerves), digestive, and others.
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    Bones (skeletal) and muscles (muscular) work together: bones provide shape/support and protect organs, while muscles pull on bones to move. For example, the ribcage (bones) shields the heart and lungs.
                  </li>
                  <li style={{ marginBottom: '0' }}>
                    The heart and blood vessels (circulatory system) work with the lungs (respiratory system) to pump oxygenated blood to every cell. The brain and nerves (nervous system) send messages between the brain and body parts.
                  </li>
                </ul>
                <img
                  src="/lesson1image2.avif"
                  alt="Lesson 1"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Figure 1.2 | Illustration of the human body, presenting the major internal organs in careful proportion
                </p>
              </div>
              
              {/* Section C - Always visible */}
              <div style={{ marginTop: '20px' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Organs are parts of systems (e.g. heart is an organ of the circulatory system, lungs are organs of the respiratory system, brain of the nervous system). Each organ is made of tissues of cells. Cells form tissues, tissues form organs, and organs form systems.
                </p>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '16px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Keeping all systems healthy (through nutrition, exercise, rest) ensures the whole body works well.
                </p>
              </div>
              {/* Sources Section - Always visible */}
              <div ref={sourcesSectionRef}>
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '20px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <div style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isLightMode ? '#000000' : 'white',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}>
                  Sources
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Learning Resources */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=learningresources.com&sz=32"
                    alt="Learning Resources"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Learning Resources
                    </div>
                    <a
                      href="https://learningresources.com/media/pdf/lr/resources/10-Easy-Steps-to-Teaching-The-Human-Body.pdf?srsltid=AfmBOorwBbdindou-o5z_WL1Y6T_NQY0DbNrrKslvIiEJmMzPZaM294-#:~:text=The%20human%20body%20is%20the,it%20working%20at%20its%20best"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://learningresources.com/media/pdf/lr/resources/10-Easy-Steps-to-Teaching-The-Human-Body.pdf
                    </a>
                  </div>
                </div>
                {/* Britannica */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=britannica.com&sz=32"
                    alt="Britannica"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Britannica
                    </div>
                    <a
                      href="https://www.britannica.com/science/human-body"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://www.britannica.com/science/human-body
                    </a>
                  </div>
                </div>
                {/* Medical News Today */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=medicalnewstoday.com&sz=32"
                    alt="Medical News Today"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Medical News Today
                    </div>
                    <a
                      href="https://www.medicalnewstoday.com/articles/organs-in-the-body"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://www.medicalnewstoday.com/articles/organs-in-the-body
                    </a>
                  </div>
                </div>
              </div>
              </div>
              {/* Sources Section End */}
            </>
          ) : false && lessonId === 2 ? (
            <>
              {/* Section A - Always visible */}
              <div style={{ position: 'relative' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Cells are the tiny units of life in our bodies; they are the basic building blocks of the body. Every tissue and organ is made of many cells. Cells are so small we need a microscope to see them, but our body has trillions. Each cell has a job (e.g. muscle cells help us move, nerve cells send signals). Cells can divide to make new cells, which helps us grow and heal.
                </p>
                <img
                  src="/lesson2image1.jpeg"
                  alt="Lesson 2"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Figure 2.1 | Red blood cells suspended in motion, their flattened, disc-like form optimized to carry oxygen efficiently through the body's narrowest vessels.
                </p>
              </div>
              
              {/* Section B - Always visible */}
              <div style={{ position: 'relative', marginTop: '20px' }}>
                <ul style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  <li style={{ marginBottom: '12px' }}>
                    Cells are tiny but numerous: the body contains trillions of cells. Each type of cell has a function (muscle cells contract for movement, nerve cells send messages). Groups of similar cells form tissues.
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    When we eat and play, cells need to divide to grow new tissue and replace old or injured cells. Cell division copies the cell's genes so the new cell is like the original.
                  </li>
                  <li style={{ marginBottom: '0' }}>
                    Cells organize life: many similar cells make a tissue, and different tissues combine to make an organ. For example, heart muscle cells form cardiac tissue, and cardiac tissue (with other tissue types) makes the heart organ.
                  </li>
                </ul>
                <img
                  src="/lesson2image2.jpg"
                  alt="Lesson 2"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Figure 2.2 | A fluorescence micrograph of intestinal tissue placed under a microscope, revealing tightly folded layers of cells and microbes.
                </p>
              </div>
              
              {/* Section C - Always visible */}
              <div style={{ marginTop: '20px' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Cells keep tissues healthy. Healthy muscle tissue comes from healthy muscle cells working together. If cells multiply healthily, organs grow and work well.
                </p>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '16px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Remember it goes cells → tissues → organs → systems. This pattern repeats at each level of our body's organization.
                </p>
              </div>
              {/* Sources Section - Always visible */}
              <div ref={sourcesSectionRef}>
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '20px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <div style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isLightMode ? '#000000' : 'white',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}>
                  Sources
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* CureSearch */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=curesearch.org&sz=32"
                    alt="CureSearch"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      CureSearch
                    </div>
                    <a
                      href="https://curesearch.org/What-is-Cancer#:~:text=Cells%20are%20the%20basic%20building,to%20perform%20either%20by%20itself"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://curesearch.org/What-is-Cancer
                    </a>
                  </div>
                </div>
                {/* Ambar Lab */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=ambar-lab.com&sz=32"
                    alt="Ambar Lab"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Ambar Lab
                    </div>
                    <a
                      href="https://ambar-lab.com/en/what-are-erythrocytes-and-what-can-they-indicate-to-us/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://ambar-lab.com/en/what-are-erythrocytes-and-what-can-they-indicate-to-us/
                    </a>
                  </div>
                </div>
                {/* Science Focus */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=sciencefocus.com&sz=32"
                    alt="Science Focus"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Science Focus
                    </div>
                    <a
                      href="https://www.sciencefocus.com/news/human-cell-atlas"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://www.sciencefocus.com/news/human-cell-atlas
                    </a>
                  </div>
                </div>
              </div>
              </div>
              {/* Sources Section End */}
            </>
          ) : false && lessonId === 3 ? (
            <>
              {/* Section A - Always visible */}
              <div style={{ position: 'relative' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Tissues are groups of similar cells working together, and organs are made of two or more tissue types. For example, muscle tissue is made of muscle cells, and your stomach is an organ made of muscle tissue plus other tissues. Groups of cells make tissues, and groups of tissues form organs. This shows that cells build tissues, tissues make organs, and organs make systems.
                </p>
                <img
                  src="/lesson3image1.jpeg"
                  alt="Lesson 3"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Skeletal muscle tissue, showing how many similar cells are grouped together to form a tissue that contributes to larger organs.
                </p>
              </div>
              
              {/* Section B - Always visible */}
              <div style={{ position: 'relative', marginTop: '20px' }}>
                <ul style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400,
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  <li style={{ marginBottom: '12px' }}>
                    A tissue is a group of similar cells doing a job. For example, muscle tissue is many muscle cells working together. Skin tissue is many skin cells joined in layers.
                  </li>
                  <li style={{ marginBottom: '12px' }}>
                    An organ is made of different tissues. For example, the heart is an organ with muscle tissue (to pump), nerve tissue (to regulate heartbeat), and blood vessel tissue (to carry blood). The stomach organ has muscle tissue (to churn food) and lining tissue (to protect and digest).
                  </li>
                  <li style={{ marginBottom: '0' }}>
                    Think of a house: cells are like bricks, tissues are like walls, and organs are like rooms. Each level builds on the smaller ones.
                  </li>
                </ul>
                <img
                  src="/lesson3image2.jpg"
                  alt="Lesson 3"
                  style={{
                    width: '96%',
                    height: 'auto',
                    marginTop: '20px',
                    display: 'block'
                  }}
                />
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '16px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <p style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '8pt',
                  color: '#3b4652',
                  marginTop: '12px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Figure 1.1 | A house used as an analogy: many small parts form larger structures, just as cells form tissues and tissues form organs.
                </p>
              </div>
              
              {/* Section C - Always visible */}
              <div style={{ marginTop: '20px' }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '20px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Examples: Skin is an organ made mostly of skin cells (epidermis tissue) and inner skin layers. The stomach is an organ made of muscle tissue (to move food), inner lining tissue (for digestive juices), and connective tissues.
                </p>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '12pt',
                  color: isLightMode ? '#000000' : 'white',
                  lineHeight: '1.6',
                  marginTop: '16px',
                  marginBottom: '0',
                  fontWeight: 400
                }}>
                  Recognizing that cells → tissue → organ helps us understand the body's structure.
                </p>
              </div>
              {/* Sources Section - Always visible */}
              <div ref={sourcesSectionRef}>
                <div
                  style={{
                    width: 'calc(100% - 0px)',
                    height: '1px',
                    backgroundColor: '#3b4652',
                    marginTop: '20px',
                    marginLeft: '0',
                    marginRight: '0',
                    marginBottom: '0'
                  }}
                />
                <div style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  color: isLightMode ? '#000000' : 'white',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}>
                  Sources
                </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* CureSearch */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=curesearch.org&sz=32"
                    alt="CureSearch"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      CureSearch
                    </div>
                    <a
                      href="https://curesearch.org/What-is-Cancer#:~:text=Cells%20are%20the%20basic%20building,for%20what%20role%20the%20cell"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://curesearch.org/What-is-Cancer
                    </a>
                  </div>
                </div>
                {/* Wikipedia */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32"
                    alt="Wikipedia"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      Wikipedia
                    </div>
                    <a
                      href="https://en.wikipedia.org/wiki/Striated_muscle_tissue"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://en.wikipedia.org/wiki/Striated_muscle_tissue
                    </a>
                  </div>
                </div>
                {/* House Digest */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src="https://www.google.com/s2/favicons?domain=housedigest.com&sz=32"
                    alt="House Digest"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isLightMode ? '#000000' : 'white',
                      marginBottom: '4px'
                    }}>
                      House Digest
                    </div>
                    <a
                      href="https://www.housedigest.com/789739/common-house-styles-to-inspire-your-next-home/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '10px',
                        fontWeight: 400,
                        color: isLightMode ? '#000000' : 'white',
                        textDecoration: 'none',
                        display: 'block',
                        wordBreak: 'break-all'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      https://www.housedigest.com/789739/common-house-styles-to-inspire-your-next-home/
                    </a>
                  </div>
                </div>
              </div>
              </div>
              {/* Sources Section End */}
            </>
          ) : null}
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
              onMouseLeave={(e) => e.target.style.color = 'white'}
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
              <span style={{ color: isLightMode ? '#000000' : 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
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
              <span style={{ color: isLightMode ? '#000000' : 'white', fontSize: '16px', fontFamily: "'Inter Tight', sans-serif" }}>
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
          transform: getTransform(),
          transition: getTransition(),
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          paddingBottom: '120px'
        }}
      >
        {/* Question Text and Icons - Consistent positioning for all IllustratedMCQ */}
        <div className="pt-32 pb-12" style={{ paddingTop: 'calc(8rem + 40px)' }}>
        <div className="flex justify-center px-8">
          <div className="flex items-center" style={{ width: '100%', maxWidth: 'calc(200px * 3 + 2rem * 2)', position: 'relative' }}>
            <h2
              className="text-base md:text-lg text-left"
              style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 500, lineHeight: '1.5', paddingRight: '100px', color: isLightMode ? '#000000' : 'white' }}
            >
                {questionData?.question || 'Select the correct answer'}
            </h2>
            {/* Icons container - aligned with right edge of third card */}
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

        {/* Cards - Consistent positioning */}
        <div className="flex justify-center items-center gap-8 px-8" style={{ minHeight: '200px', paddingTop: '0px', paddingBottom: '40px' }}>
          {!questionData ? (
            <div style={{ color: 'white' }}>Loading question data...</div>
          ) : !questionData.options || questionData.options.length === 0 ? (
            <div style={{ color: 'white' }}>No options available</div>
          ) : (
            questionData.options.map((option, index) => {
              const cardId = option.id
              const isCorrect = option.correct
              const isFirstCard = index === 0
              const currentState = cardStates[cardId] || 'default'
              
              return (
                <div key={cardId} style={{ position: 'relative', display: 'inline-block' }}>
        <img
                    src={getCardImage(cardId, currentState)}
                    alt={option.label}
                    draggable="false"
                    onMouseDown={() => {
                      // Don't allow pressing if card is already selected
                      if (selectedCard === cardId || currentState === 'selected') return
                      if (questionState === 'active' && isCardInteractable) {
                        setPressedCard(cardId)
                      }
                    }}
                    onMouseUp={() => {
                      setPressedCard(null)
          }}
          onMouseLeave={() => {
                      if (hoveredCard === cardId) {
              setHoveredCard(null)
            }
                      setPressedCard(null)
                    }}
          onMouseEnter={() => {
                      if (questionState === 'active' && currentState === 'default') {
                        setHoveredCard(cardId)
            }
          }}
          style={{
            maxWidth: '200px',
                      width: '200px',
                      height: 'auto',
            display: 'block',
                      cursor: (isCardInteractable && selectedCard !== cardId && currentState !== 'selected') ? 'pointer' : 'default',
                      position: 'relative',
                      zIndex: 0,
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none'
          }}
                    onClick={(e) => {
                      // Prevent clicking if card is already selected
                      if (selectedCard === cardId || currentState === 'selected') {
                        e.preventDefault()
                        e.stopPropagation()
                        return
                      }
                      handleCardClick(cardId)
                    }}
                    onError={(e) => {
                      console.error(`${option.label} card image failed to load:`, e.target.src)
                    }}
                  />
                  {/* Gleam Overlay - only on correct card */}
                  {showGleamOverlay && isCorrect && (
                    <img
                      src="/gleam_overlay.gif"
                      alt="Gleam"
          style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '200px',
                        height: 'auto',
            maxWidth: '200px',
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

export default IllustratedMCQ
