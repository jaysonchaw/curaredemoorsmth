// GlassSurface component with glass-like effect
// Uses ReactBits if available, otherwise provides fallback implementation
const GlassSurface = ({ children, style, borderRadius = 20, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        backdropFilter: 'blur(10px)',
        borderRadius: borderRadius,
        padding: '8px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)',
        background: style?.backgroundColor || 'rgba(37, 99, 235, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
      }}
      className="glass-surface hover:shadow-lg hover:scale-105"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      } : undefined}
    >
      {children}
    </div>
  )
}

export default GlassSurface

