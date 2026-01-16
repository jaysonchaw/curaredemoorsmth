import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonContent } from '../data/lessons/lessonContentLoader'
import { getLessonMetadata } from '../data/lessons/lessonLoader'
import LessonContent from '../components/LessonContent'
import { getInitialLightMode } from '../utils/lightModeInit'

const UnitContent = () => {
  const { unitId } = useParams()
  const navigate = useNavigate()
  const unitIndex = parseInt(unitId, 10) - 1
  const [isLoading, setIsLoading] = useState(true)
  const [isLightMode, setIsLightMode] = useState(getInitialLightMode)

  // Unit definitions matching TestSecureV2
  const units = [
    ['Unit 1: Foundations of Human Biology', 0, 2],
    ['Unit 2: Structure and Control of the Body', 3, 11],
    ['Unit 3: Transport and Energy in the Body', 12, 19],
    ['Unit 4: Protection and Immune Health', 20, 27],
    ['Unit 5: Growth and Everyday Health', 28, 34],
    ['Unit 6: Genetics and Modern Medicine', 35, 44]
  ]

  const lessonNames = [
    'Human Body Systems',
    'Cells',
    'Personalized Practice',
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

  // Hide loading overlay after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // 300ms delay for smooth transition
    
    return () => clearTimeout(timer)
  }, [unitId]) // Reset when unit changes

  if (unitIndex < 0 || unitIndex >= units.length) {
    return (
      <div style={{
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isLightMode ? '#000000' : 'white',
        fontFamily: "'Unbounded', sans-serif",
        fontSize: '24px'
      }}>
        Unit not found
      </div>
    )
  }

  const [unitName, startIndex, endIndex] = units[unitIndex]
  
  // Get all lesson indices in this unit (skip Personalized Practice and Review)
  // Map array index to actual lesson ID (1-28)
  const lessonIndices = []
  let actualLessonId = 1 // Start from lesson 1
  
  for (let i = 0; i <= endIndex; i++) {
    const name = lessonNames[i]
    if (name !== 'Personalized Practice' && name !== 'Review') {
      if (i >= startIndex && i <= endIndex) {
        // This lesson is in the current unit
        lessonIndices.push({ index: i, lessonId: actualLessonId, name })
      }
      actualLessonId++ // Increment for actual lessons only
    }
  }

  // Check which lessons are bookmarked
  // Bookmarks are stored in localStorage with key pattern: bookmark_lesson_${lessonId}
  const isBookmarked = (lessonId) => {
    const bookmarkKey = `bookmark_lesson_${lessonId}`
    const bookmarked = localStorage.getItem(bookmarkKey)
    return bookmarked === 'true'
  }

  // Sort lessons: bookmarked ones first, maintaining their order among bookmarked ones
  const sortedLessonIndices = [...lessonIndices].sort((a, b) => {
    const aBookmarked = isBookmarked(a.lessonId)
    const bBookmarked = isBookmarked(b.lessonId)
    
    if (aBookmarked && !bBookmarked) return -1
    if (!aBookmarked && bBookmarked) return 1
    // If both have same bookmark status, maintain original order
    return 0
  })

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
      
      <div style={{
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        minHeight: '100vh',
        padding: '80px 20px 40px 20px'
      }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#5e8ef7',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '32px',
            padding: '8px 0'
          }}
        >
          ← Back to Course
        </button>

        {/* Unit title */}
        <h1 style={{
          color: isLightMode ? '#000000' : 'white',
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '32px',
          fontWeight: 600,
          marginBottom: '40px'
        }}>
          {unitName.replace(/^Unit \d+: /, '')}
        </h1>

        {/* All lesson content */}
        {sortedLessonIndices.map(({ index, lessonId, name }, lessonIdx) => {
          const content = getLessonContent(lessonId)
          const metadata = getLessonMetadata(lessonId)
          const bookmarked = isBookmarked(lessonId)
          
          if (!content) return null

          return (
            <div key={lessonId} style={{ marginBottom: '60px' }}>
              {/* Lesson title */}
              <h2 style={{
                color: '#5e8ef7',
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: `2px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {bookmarked && (
                  <img
                    src="/bookmarkedicon.png"
                    alt="Bookmarked"
                    style={{
                      height: '21.6px', // 90% of 24px
                      width: 'auto',
                      display: 'block'
                    }}
                  />
                )}
                {name}
              </h2>

              {/* Lesson content */}
              <div style={{
                backgroundColor: isLightMode ? '#ffffff' : '#1a2332',
                borderRadius: '8px',
                padding: '32px',
                minHeight: '200px'
              }}>
                <LessonContent lessonId={lessonId} sourcesSectionRef={null} isLightMode={isLightMode} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}

export default UnitContent

