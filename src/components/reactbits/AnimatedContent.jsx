import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// AnimatedContent component using Framer Motion
const AnimatedContent = ({
  children,
  distance = 150,
  direction = 'horizontal',
  reverse = false,
  duration = 1.2,
  ease = 'bounce.out',
  initialOpacity = 0.2,
  animateOpacity = true,
  scale = 1.1,
  threshold = 0.2,
  delay = 0.3
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
      { threshold, rootMargin: '-100px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [threshold])

  const getInitialPosition = () => {
    if (direction === 'horizontal') {
      return { x: reverse ? distance : -distance, y: 0 }
    } else {
      return { x: 0, y: reverse ? distance : -distance }
    }
  }

  const getAnimatePosition = () => {
    return { x: 0, y: 0 }
  }

  const easeMap = {
    'bounce.out': [0.68, -0.55, 0.265, 1.55],
    'ease.out': [0.25, 0.46, 0.45, 0.94],
    'ease.in': [0.42, 0, 1, 1],
    'ease.inOut': [0.42, 0, 0.58, 1],
  }

  const easing = easeMap[ease] || easeMap['ease.out']

  return (
    <motion.div
      ref={ref}
      initial={{
        ...getInitialPosition(),
        opacity: animateOpacity ? initialOpacity : 1,
        scale: scale,
      }}
      animate={
        isVisible
          ? {
              ...getAnimatePosition(),
              opacity: 1,
              scale: 1,
            }
          : {
              ...getInitialPosition(),
              opacity: animateOpacity ? initialOpacity : 1,
              scale: scale,
            }
      }
      transition={{
        duration,
        delay,
        ease: easing,
      }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedContent

