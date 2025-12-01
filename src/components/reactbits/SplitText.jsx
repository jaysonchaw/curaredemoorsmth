import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// SplitText component using Framer Motion
const SplitText = ({ 
  text, 
  className = '', 
  delay = 100, 
  duration = 0.6,
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center'
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold, rootMargin])

  // Split text into words, preserving spaces
  if (!text) return null
  const words = text.split(/(\s+)/)
  let charIndex = 0

  return (
    <div 
      ref={ref}
      className={className}
      style={{ 
        textAlign,
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        lineHeight: '1.5'
      }}
    >
      {words.map((word, wordIndex) => {
        const chars = word.split('')
        
        // If it's a space, just render it as a regular space (will wrap naturally)
        if (word.trim() === '') {
          charIndex += word.length
          return <span key={wordIndex} style={{ whiteSpace: 'pre' }}>{word}</span>
        }
        
        // For actual words, wrap characters in a word container that prevents breaking
        const wordElements = chars.map((char, charPos) => {
          const currentIndex = charIndex++
          return (
            <motion.span
              key={`${wordIndex}-${charPos}`}
              initial={from}
              animate={isVisible ? to : from}
              transition={{
                duration,
                delay: currentIndex * (delay / 1000),
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{ display: 'inline-block' }}
            >
              {char}
            </motion.span>
          )
        })
        
        return (
          <span 
            key={wordIndex} 
            style={{ 
              display: 'inline',
              whiteSpace: 'nowrap' 
            }}
          >
            {wordElements}
          </span>
        )
      })}
    </div>
  )
}

export default SplitText

