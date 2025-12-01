import { motion } from 'framer-motion'
import './Counter.css'

function DigitColumn({ digit, height, fontSize, textColor, fontWeight }) {
  return (
    <div
      className="counter-digit"
      style={{
        height,
        overflow: 'hidden',
        position: 'relative',
        width: `${fontSize * 0.6}px`,
        minWidth: `${fontSize * 0.6}px`
      }}
    >
      <motion.div
        animate={{ y: -digit * height }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            style={{
              height,
              fontSize,
              color: textColor,
              fontWeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              width: '100%'
            }}
          >
            {i}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places = [100, 10, 1],
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = '#000000',
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = '#ffffff',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle
}) {
  const height = fontSize + padding
  
  const defaultCounterStyle = {
    fontSize,
    gap: gap,
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    color: textColor,
    fontWeight: fontWeight,
    display: 'flex',
    alignItems: 'center',
    position: 'relative'
  }
  
  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  }
  
  const defaultBottomGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  }

  return (
    <div className="counter-container" style={containerStyle}>
      <div className="counter-counter" style={{ ...defaultCounterStyle, ...counterStyle }}>
        {places.map(place => {
          const digit = Math.floor(value / place) % 10
          return (
            <DigitColumn
              key={place}
              digit={digit}
              height={height}
              fontSize={fontSize}
              textColor={textColor}
              fontWeight={fontWeight}
            />
          )
        })}
      </div>
      <div className="gradient-container">
        <div 
          className="top-gradient" 
          style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle}
        ></div>
        <div
          className="bottom-gradient"
          style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle}
        ></div>
      </div>
    </div>
  )
}
