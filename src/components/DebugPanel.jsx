import { useState, useRef, useEffect } from 'react'

const DebugPanel = ({ onAnswerCorrect, onAnswerWrong }) => {
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const panelRef = useRef(null)
  const cornerRef = useRef(null)

  const handleMouseDown = (e) => {
    if (cornerRef.current && cornerRef.current.contains(e.target)) {
      e.preventDefault()
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Keep panel within viewport
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 200)
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 100)
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: '#29323c',
        border: '2px solid #3b4652',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Draggable corner */}
      <div
        ref={cornerRef}
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '20px',
          height: '20px',
          backgroundColor: '#3b4652',
          borderTopRightRadius: '6px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseDown={handleMouseDown}
      >
        <div style={{
          width: '8px',
          height: '8px',
          backgroundImage: 'repeating-linear-gradient(45deg, #6b7280, #6b7280 2px, transparent 2px, transparent 4px)',
          opacity: 0.6
        }} />
      </div>

      <div style={{
        fontFamily: "'Inter Tight', sans-serif",
        fontSize: '10px',
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
        paddingRight: '20px'
      }}>
        Debug Panel
      </div>

      <button
        onClick={onAnswerCorrect}
        style={{
          padding: '8px 12px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 500,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
      >
        Answer Question
      </button>

      <button
        onClick={onAnswerWrong}
        style={{
          padding: '8px 12px',
          backgroundColor: '#f73d35',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: "'Inter Tight', sans-serif",
          fontWeight: 500,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f73d35'}
      >
        Get Question Wrong
      </button>
    </div>
  )
}

export default DebugPanel

