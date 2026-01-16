import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Pricing = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Set background to black for pricing page
    document.body.style.backgroundColor = '#000000'
    document.documentElement.style.backgroundColor = '#000000'

    return () => {
      // Reset background on unmount
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 40px',
      position: 'relative'
    }}>
      {/* Back Button - Top Left Corner */}
      <button
        type="button"
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: '#ffffff',
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '16px',
          fontWeight: 400,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        ← Back
      </button>

      {/* Curare Pro Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '60px'
      }}>
        {/* Curare Text */}
        <div style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '36px',
          fontWeight: 700,
          color: '#ffffff'
        }}>
          curare
        </div>
        {/* Pro Badge */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '36px',
            fontWeight: 700,
            color: '#000000'
          }}>
            pro
          </span>
        </div>
      </div>

      {/* Error Message */}
      <h1 style={{
        fontFamily: "'Unbounded', sans-serif",
        fontSize: '32px',
        fontWeight: 700,
        color: '#ffffff',
        textAlign: 'center',
        maxWidth: '800px',
        lineHeight: '1.4'
      }}>
        Sorry, we're facing some technical difficulties at the moment.
      </h1>
    </div>
  )
}

export default Pricing
