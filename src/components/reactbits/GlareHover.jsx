import { useState, useRef } from 'react'

// GlareHover component with moving glare effect
const GlareHover = ({ 
  children, 
  glareColor = '#ffffff', 
  glareOpacity = 0.3,
  glareAngle = -30,
  glareSize = 300,
  transitionDuration = 800,
  playOnce = false
}) => {
  const [glarePosition, setGlarePosition] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setGlarePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    if (!playOnce) {
      setIsHovered(false)
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block', overflow: 'hidden' }}
    >
      {children}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            left: glarePosition.x - glareSize / 2,
            top: glarePosition.y - glareSize / 2,
            width: glareSize,
            height: glareSize,
            background: `radial-gradient(circle, ${glareColor} 0%, transparent 70%)`,
            opacity: glareOpacity,
            pointerEvents: 'none',
            transform: `rotate(${glareAngle}deg)`,
            transition: `opacity ${transitionDuration}ms ease`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  )
}

export default GlareHover

