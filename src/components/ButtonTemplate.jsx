import React from 'react'

/**
 * ButtonTemplate - Renders buttons using PNG templates
 * @param {string} variant - 'button1' or 'button2'
 * @param {string} text - Text to display on button
 * @param {string} textColor - Text color (default: 'white' for button1, '#2563ebff' for button2)
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} type - Button type (default: 'button')
 */
const ButtonTemplate = ({ 
  variant = 'button1', 
  text, 
  textColor, 
  onClick, 
  className = '', 
  style = {},
  disabled = false,
  type = 'button'
}) => {
  // Default text colors
  const defaultTextColor = variant === 'button1' ? 'white' : '#2563ebff'
  const finalTextColor = textColor || defaultTextColor
  
  // Get button image path
  const buttonImage = variant === 'button1' ? '/button1.png' : '/button2.png'
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-block ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: style.width || '200px',
        height: style.height || 'auto',
        ...style
      }}
    >
      <div className="relative w-full h-full">
        <img 
          src={buttonImage} 
          alt={text || 'Button'} 
          className="w-full h-full object-contain"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            color: finalTextColor,
            fontWeight: 'bold',
            fontSize: '1rem',
            textAlign: 'center',
            padding: '0.75rem 1.5rem',
            pointerEvents: 'none',
            transform: 'translateY(-4px)'
          }}
        >
          {text}
        </div>
      </div>
    </button>
  )
}

export default ButtonTemplate

