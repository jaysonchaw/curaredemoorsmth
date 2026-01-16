import { useState } from 'react'

const Roadmap = () => {
  // Generate 28 lesson names (placeholder - you can replace with actual lesson names)
  const generateLessonNames = () => {
    const lessons = []
    for (let i = 1; i <= 28; i++) {
      lessons.push(`Lesson ${i}`)
    }
    return lessons
  }

  const lessonNames = generateLessonNames()

  // Generate smooth snake pattern X offsets
  // Creates a smooth, curvy snake pattern starting from center
  const getSnakeOffset = (index) => {
    // Create a smooth, organic snake pattern
    // Pattern: starts at center, gradually curves right, then left, creating smooth waves
    const baseAmplitude = 120 // Maximum offset in pixels
    const frequency = 0.2 // Controls curve frequency (lower = more gradual curves)
    
    // Use sine wave for smooth curves
    // The pattern will naturally start at center (index 0 = 0 offset)
    // and create smooth left-right waves
    const offset = Math.sin(index * frequency) * baseAmplitude
    
    return offset
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: '40px',
      paddingBottom: '40px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px', // Comfortable spacing between lessons
        position: 'relative'
      }}>
        {lessonNames.map((lessonName, index) => {
          const xOffset = getSnakeOffset(index)
          const isFirst = index === 0
                  
                  return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                transform: `translateX(${xOffset}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              {/* Lesson Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={isFirst ? '/currentlesson.svg' : '/futurelesson.svg'}
                  alt={isFirst ? 'Current Lesson' : 'Future Lesson'}
                  draggable="false"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none'
                  }}
                          />
                        </div>
                        
              {/* Lesson Name */}
              <div style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '14pt',
                fontWeight: 400, // Unbolded
                color: '#1f2937',
                whiteSpace: 'nowrap'
              }}>
                {lessonName}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Roadmap
