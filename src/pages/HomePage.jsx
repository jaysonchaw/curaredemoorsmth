import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const HomePage = () => {
  const navigate = useNavigate()
  
  // Prevent any automatic redirects - homepage is always public
  useEffect(() => {
    // Clear any stored redirect URLs that might cause issues
    sessionStorage.removeItem('redirect_after_auth')
    sessionStorage.removeItem('redirect_url')
    localStorage.removeItem('redirect_after_auth')
    localStorage.removeItem('redirect_url')
  }, [])
  const [getStartedHover, setGetStartedHover] = useState(false)
  const [getStartedPressed, setGetStartedPressed] = useState(false)
  const [showNavLine, setShowNavLine] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)
  const [learnMoreHover, setLearnMoreHover] = useState(false)
  const [learnMorePressed, setLearnMorePressed] = useState(false)
  const [learnMoreHover2, setLearnMoreHover2] = useState(false)
  const [learnMorePressed2, setLearnMorePressed2] = useState(false)
  const [proHeaderBgColor, setProHeaderBgColor] = useState('#ffffff')
  const [finalSectionBgColor, setFinalSectionBgColor] = useState('#000000')
  const [navBarVisible, setNavBarVisible] = useState(true)
  const [buttonProHover, setButtonProHover] = useState(false)
  const [buttonProPressed, setButtonProPressed] = useState(false)
  const [getStartedHoverFinal, setGetStartedHoverFinal] = useState(false)
  const [getStartedPressedFinal, setGetStartedPressedFinal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const proHeaderRef = useRef(null)
  const finalSectionRef = useRef(null)

  useEffect(() => {
    // Set homepage background to white
    document.body.style.backgroundColor = '#ffffff'
    document.documentElement.style.backgroundColor = '#ffffff'
    
    // Homepage is public - no auth checks needed
    // Log to debug any redirect issues
    console.log('[HomePage] Mounted - homepage should be accessible')
    
    const handleScroll = () => {
      // Show line after scrolling 100px
      if (window.scrollY > 100) {
        setShowNavLine(true)
      } else {
        setShowNavLine(false)
      }

      // Calculate background color for proheader section
      if (proHeaderRef.current) {
        const rect = proHeaderRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const sectionTop = rect.top
        const sectionHeight = rect.height
        const sectionBottom = rect.bottom
        
        // Start transitioning when section enters viewport
        // Transition completes when section is comfortably visible
        const transitionStart = windowHeight * 0.7 // Start transition
        const transitionEnd = windowHeight * 0.3 // Complete transition when section top is at 30% of viewport
        
        // Check if section has scrolled past (bottom is above viewport)
        if (sectionBottom <= 0) {
          // Section has scrolled past - turn white
          setProHeaderBgColor('#ffffff')
          setNavBarVisible(true) // Show nav bar when past pro section
        } else if (sectionTop < transitionStart && sectionTop > -sectionHeight && sectionBottom > 0) {
          // In transition zone
          const progress = Math.min(1, Math.max(0, (transitionStart - sectionTop) / (transitionStart - transitionEnd)))
          
          // Interpolate from white to black
          const whiteValue = 255
          const blackValue = 0
          const currentValue = Math.round(whiteValue - (whiteValue - blackValue) * progress)
          const hexColor = `#${currentValue.toString(16).padStart(2, '0')}${currentValue.toString(16).padStart(2, '0')}${currentValue.toString(16).padStart(2, '0')}`
          
          setProHeaderBgColor(hexColor)
          // Hide nav bar when transition is more than 50% complete
          setNavBarVisible(progress < 0.5)
        } else if (sectionTop <= transitionEnd && sectionBottom > 0) {
          // Fully black when comfortably visible (and section is still in viewport)
          setProHeaderBgColor('#000000')
          setNavBarVisible(false) // Hide nav bar when background is black
        } else if (sectionTop >= transitionStart || sectionBottom <= 0) {
          // Fully white when not yet in transition zone (before pro section) OR when scrolled past
          setProHeaderBgColor('#ffffff')
          setNavBarVisible(true) // Show nav bar when background is white
        }
      } else {
        // If proHeaderRef is not available yet, show nav bar (at start of page)
        setNavBarVisible(true)
      }

      // Calculate background color for final section (transition from black to white)
      if (finalSectionRef.current) {
        const rect = finalSectionRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const sectionTop = rect.top
        const sectionHeight = rect.height
        
        // Start transitioning when section enters viewport
        // Transition completes when section is comfortably visible
        const transitionStart = windowHeight * 0.7
        const transitionEnd = windowHeight * 0.3
        
        if (sectionTop < transitionStart && sectionTop > -sectionHeight) {
          // Calculate progress: 0 when at transitionStart, 1 when at transitionEnd
          const progress = Math.min(1, Math.max(0, (transitionStart - sectionTop) / (transitionStart - transitionEnd)))
          
          // Interpolate from black to white
          const blackValue = 0
          const whiteValue = 255
          const currentValue = Math.round(blackValue + (whiteValue - blackValue) * progress)
          const hexColor = `#${currentValue.toString(16).padStart(2, '0')}${currentValue.toString(16).padStart(2, '0')}${currentValue.toString(16).padStart(2, '0')}`
          
          setFinalSectionBgColor(hexColor)
          // Show nav bar when transition is more than 50% complete
          setNavBarVisible(progress > 0.5)
        } else if (sectionTop <= transitionEnd) {
          // Fully white when comfortably visible
          setFinalSectionBgColor('#ffffff')
          setNavBarVisible(true) // Show nav bar when background is white
        } else if (sectionTop >= transitionStart) {
          // Fully black when not yet in transition zone (before final section)
          setFinalSectionBgColor('#000000')
          // Don't set nav bar here - let pro section logic handle it
        }
      }
    }

    // Set background to white for homepage and keep it white always
    const forceWhiteBackground = () => {
      document.body.style.backgroundColor = '#ffffff'
      document.documentElement.style.backgroundColor = '#ffffff'
    }
    
    forceWhiteBackground()

    // Ensure background stays white when scrolling past top (negative scroll) or at any scroll position
    const handleScrollPastTop = () => {
      forceWhiteBackground()
    }

    // Initial state: show nav bar at start
    setNavBarVisible(true)
    
    // Use requestAnimationFrame for smooth background updates during fast scrolling
    let rafId = null
    const handleScrollWithRAF = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        handleScroll()
        forceWhiteBackground() // Always force white on homepage
      })
    }
    
    window.addEventListener('scroll', handleScrollWithRAF, { passive: true })
    window.addEventListener('scroll', handleScrollPastTop, { passive: true })
    // Also use an interval to ensure background stays white during fast scrolling
    const backgroundCheckInterval = setInterval(forceWhiteBackground, 16) // ~60fps
    
    handleScroll() // Initial calculation
    return () => {
      window.removeEventListener('scroll', handleScrollWithRAF)
      window.removeEventListener('scroll', handleScrollPastTop)
      if (rafId) cancelAnimationFrame(rafId)
      clearInterval(backgroundCheckInterval)
      // Reset background on unmount
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  return (
    <>
      {/* White Loading Screen */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#ffffff',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Loading content can be added here if needed */}
        </div>
      )}
    <div style={{
      minHeight: '100vh',
      backgroundColor: proHeaderBgColor, // Fluid transition from white to black
      width: '100%',
      transition: 'background-color 0.1s ease-out'
    }}>
      {/* Sticky Nav Bar - Fixed overlay, doesn't push content */}
      <nav style={{
        position: 'fixed',
        top: navBarVisible ? 0 : '-100px', // Move up when hidden
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        zIndex: 1000,
        width: '100%',
        transition: 'top 0.3s ease-out' // Smooth transition
      }}>
        <div style={{
          height: '83px', // 64px * 1.3 = 83.2px (30% taller)
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 250px' // Keep original padding
        }}>
          {/* Logo */}
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#2563eb'
          }}>
            curare
          </div>

          {/* Signup Button */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => navigate('/auth'), 100)
            }}
            onMouseEnter={() => setSignupHover(true)}
            onMouseLeave={() => {
              setSignupHover(false)
              setSignupPressed(false)
            }}
            onMouseDown={() => setSignupPressed(true)}
            onMouseUp={() => setSignupPressed(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateX(120px)' // Move 120px to the right
            }}
          >
            <img
              src={
                signupPressed
                  ? '/signuppressedhp.svg'
                  : signupHover
                  ? '/signuphoverhp.svg'
                  : '/signupdefaulthp.svg'
              }
              alt="Sign Up"
              draggable={false}
              style={{
                height: '56px',
                width: 'auto',
                display: 'block'
              }}
            />
          </button>
        </div>
        
        {/* Fade-in line at bottom - full width */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2pt',
          backgroundColor: showNavLine ? '#d0d1d2' : 'transparent',
          transition: 'background-color 0.3s ease',
          width: '100%'
        }} />
      </nav>
      
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', // Full viewport height without nav
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        paddingTop: '150px', // 180px - 30px = 150px
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '30px', // Moved closer
          width: '100%',
          flexWrap: 'wrap'
        }}>
          {/* Left: welcome11.svg scaled 2.5x */}
          <div style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/welcome11.svg"
              alt="Welcome 11"
              draggable={false}
              style={{
                height: '562px', // 432px * 1.3 = 562px (30% bigger than original)
                width: 'auto',
                maxWidth: '100%'
              }}
            />
          </div>

          {/* Right: Text Content */}
          <div style={{
            flex: '1 1 500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            alignItems: 'flex-start',
            justifyContent: 'center',
            transform: 'translateX(-120px)' // Move 120px to the left
          }}>
            {/* Headline */}
            <h1 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '60px',
              fontWeight: 700,
              lineHeight: '1.2',
              margin: 0,
              textAlign: 'left',
              color: '#000000'
            }}>
              <span style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0 8px'
              }}>
                learn medicine,
              </span>
              <br />
              <span style={{ color: '#000000' }}>
                don't memorize it
              </span>
            </h1>

            {/* Body Text */}
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '20px',
              color: '#000000',
              margin: 0,
              lineHeight: '1.5',
              textAlign: 'left'
            }}>
              Short lessons and visual exercises that help you understand anatomy and medical concepts. Get started with Curare.
            </p>

            {/* Get Started Button */}
            <div style={{
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true)
                  setTimeout(() => navigate('/welcome'), 100)
                }}
                onMouseEnter={() => setGetStartedHover(true)}
                onMouseLeave={() => {
                  setGetStartedHover(false)
                  setGetStartedPressed(false)
                }}
                onMouseDown={() => setGetStartedPressed(true)}
                onMouseUp={() => setGetStartedPressed(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start'
                }}
              >
                <img
                  src={
                    getStartedPressed
                      ? '/getstartedpressedhp.svg'
                      : getStartedHover
                      ? '/getstarteddefaulthp.svg' // Will need to create hover variant
                      : '/getstarteddefaulthp.svg'
                  }
                  alt="Get Started"
                  draggable={false}
                  style={{
                    height: '56px',
                    width: 'auto',
                    display: 'block'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Students Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row', // Explicitly set row direction
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        maxWidth: '1400px',
        margin: '0 auto',
        marginLeft: '100px', // 120px - 20px = 100px (moved left by 20px more)
        gap: '80px'
      }}>
        {/* Left: welcome16.svg */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '400px'
        }}>
          <img
            src="/welcome16.svg"
            alt="Welcome 16"
            draggable={false}
            style={{
              height: 'auto',
              width: 'auto',
              transform: 'scale(1.3)', // 30% bigger
              transformOrigin: 'center',
              maxWidth: '100%',
              display: 'block'
            }}
            onError={(e) => {
              console.error('Failed to load welcome16.svg:', e)
              e.target.style.border = '2px solid red' // Debug: show red border if image fails
            }}
          />
        </div>

        {/* Right: Text Content */}
        <div style={{
          flex: '1 1 500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'flex-start',
          justifyContent: 'center',
          marginLeft: '60px', // Move 60px to the right
          maxWidth: '600px' // Limit width so text doesn't extend too far
        }}>
          {/* Header */}
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '50px',
            fontWeight: 700,
            lineHeight: '1.2',
            margin: 0,
            textAlign: 'left',
            color: '#000000'
          }}>
            for <span style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0 8px'
            }}>students</span>,
            <br />
            by <span style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0 8px'
            }}>student(s)</span>
          </h2>

          {/* Body Text */}
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '20px',
            color: '#000000',
            margin: 0,
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Designed to help you understand school biology and apply it beyond the classroom.
          </p>

          {/* Learn More Button */}
          <div style={{
            marginTop: '8px'
          }}>
            <button
              type="button"
              onClick={() => navigate('/about-us')}
              onMouseEnter={() => setLearnMoreHover(true)}
              onMouseLeave={() => {
                setLearnMoreHover(false)
                setLearnMorePressed(false)
              }}
              onMouseDown={() => setLearnMorePressed(true)}
              onMouseUp={() => setLearnMorePressed(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              <img
                src={
                  learnMorePressed
                    ? '/learnmorepressedhp.svg'
                    : learnMoreHover
                    ? '/learnmorehoverhp.svg'
                    : '/learnmoredefaulthp.svg'
                }
                alt="Learn More"
                draggable={false}
                style={{
                  height: '56px',
                  width: 'auto',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Adaptive Learning Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '80px 40px',
        paddingLeft: '250px', // Moved to the right (from 150px)
        maxWidth: '1400px',
        margin: '0 auto',
        gap: '80px'
      }}>
        {/* Left: Text Content */}
        <div style={{
          flex: '0 1 500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'flex-start',
          justifyContent: 'center',
          maxWidth: '600px'
        }}>
          {/* Header */}
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '50px',
            fontWeight: 700,
            lineHeight: '1.2',
            margin: 0,
            textAlign: 'left',
            color: '#000000'
          }}>
            <span style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0 8px'
            }}>adaptive</span> learning
          </h2>

          {/* Body Text */}
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '20px',
            color: '#000000',
            margin: 0,
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            Guided and interactive lessons at your own pace, in your own time. Anatomy in mind.
          </p>

          {/* Learn More Button */}
          <div style={{
            marginTop: '8px'
          }}>
            <button
              type="button"
              onClick={() => navigate('/about-us')}
              onMouseEnter={() => setLearnMoreHover2(true)}
              onMouseLeave={() => {
                setLearnMoreHover2(false)
                setLearnMorePressed2(false)
              }}
              onMouseDown={() => setLearnMorePressed2(true)}
              onMouseUp={() => setLearnMorePressed2(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start'
              }}
            >
              <img
                src={
                  learnMorePressed2
                    ? '/learnmorepressedhp.svg'
                    : learnMoreHover2
                    ? '/learnmorehoverhp.svg'
                    : '/learnmoredefaulthp.svg'
                }
                alt="Learn More"
                draggable={false}
                style={{
                  height: '56px',
                  width: 'auto',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>

        {/* Right: welcome17.svg */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '400px'
        }}>
          <img
            src="/welcome17.svg"
            alt="Welcome 17"
            draggable={false}
            style={{
              height: 'auto',
              width: 'auto',
              maxWidth: '100%',
              display: 'block'
            }}
            onError={(e) => {
              console.error('Failed to load welcome17.svg:', e)
              e.target.style.border = '2px solid red' // Debug: show red border if image fails
            }}
          />
        </div>
      </section>

      {/* Pro Header Section with Fluid Background Transition */}
      <section 
        ref={proHeaderRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          gap: '40px',
          position: 'relative',
          backgroundColor: proHeaderBgColor,
          transition: 'background-color 0.1s ease-out'
        }}
      >
        {/* Box Pro - Top Left */}
        <div style={{
          position: 'absolute',
          top: '120px',
          left: '100px',
          transform: 'rotate(-14deg)',
          filter: 'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.3))'
        }}>
          <img
            src="/boxpro.svg"
            alt="Box Pro"
            draggable={false}
            style={{
              width: '250px',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Icon Pro - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          right: '100px',
          transform: 'rotate(25deg)',
          filter: 'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.3))'
        }}>
          <img
            src="/iconpro.svg"
            alt="Icon Pro"
            draggable={false}
            style={{
              width: '130.6px', // 1.2x of 108.8px (lesson icon size)
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
        {/* Curare Pro Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
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
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1400px'
        }}>
          <img
            src="/proheader.svg"
            alt="Pro Header"
            draggable={false}
            style={{
              width: '100%',
              maxWidth: '800px',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
        {/* Button Pro */}
        <button
          type="button"
          onClick={() => navigate('/pricing')}
          onMouseEnter={() => setButtonProHover(true)}
          onMouseLeave={() => {
            setButtonProHover(false)
            setButtonProPressed(false)
          }}
          onMouseDown={() => setButtonProPressed(true)}
          onMouseUp={() => setButtonProPressed(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            height: '56px', // Same height as other buttons
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'drop-shadow(0 8px 16px rgba(255, 255, 255, 0.3))' // Soft white glow below button
          }}
        >
          <img
            src={buttonProPressed ? '/buttonpropressed.svg' : '/buttonpro.svg'}
            alt="Button Pro"
            draggable={false}
            style={{
              height: '56px', // Set height to 56px
              width: 'auto',
              display: 'block',
              objectFit: 'contain' // Crop to rectangular shape
            }}
          />
        </button>
      </section>

      {/* Final Section - Start Learning Today */}
      <section 
        ref={finalSectionRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          backgroundColor: finalSectionBgColor,
          transition: 'background-color 0.1s ease-out',
          position: 'relative'
        }}
      >
        {/* Start Learning Today Text - Moved 90px down */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transform: 'translateY(90px)',
          marginBottom: '-90px'
        }}>
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '60pt',
            fontWeight: 700,
            color: finalSectionBgColor === '#000000' ? '#ffffff' : '#000000',
            lineHeight: '1.2',
            transition: 'color 0.1s ease-out'
          }}>
            start
          </div>
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '60pt',
            fontWeight: 700,
            color: '#2563eb',
            lineHeight: '1.2'
          }}>
            learning
          </div>
          <div style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '60pt',
            fontWeight: 700,
            color: finalSectionBgColor === '#000000' ? '#ffffff' : '#000000',
            lineHeight: '1.2',
            transition: 'color 0.1s ease-out'
          }}>
            today
          </div>
        </div>

        {/* Welcome 18 SVG */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1400px',
          marginTop: '-60px',
          marginBottom: '-60px'
        }}>
          <img
            src="/welcome18.svg"
            alt="Welcome 18"
            draggable={false}
            style={{
              width: '100%',
              maxWidth: '800px',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>

        {/* Get Started Button - Moved 120px up */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: 'translateY(-120px)',
          marginTop: '-120px',
          position: 'relative',
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setTimeout(() => navigate('/welcome'), 100)
            }}
            onMouseDown={() => setGetStartedPressedFinal(true)}
            onMouseUp={() => setGetStartedPressedFinal(false)}
            onMouseLeave={() => setGetStartedPressedFinal(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
              position: 'relative',
              zIndex: 10
            }}
          >
            <img
              src={
                getStartedPressedFinal
                  ? '/getstartedpressedhp.svg'
                  : '/getstarteddefaulthp.svg'
              }
              alt="Get Started"
              draggable={false}
              style={{
                height: '56px',
                width: 'auto',
                display: 'block',
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#000000',
        width: '100%',
        padding: '80px 150px 40px',
        color: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '60px'
        }}>
          {/* Top Section: Logo and Navigation Columns */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: '120px'
          }}>
            {/* Logo */}
            <div style={{
              flex: '0 0 auto'
            }}>
              <h3 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '36px', // 24px * 1.5 = 36px
                fontWeight: 700,
                color: '#ffffff',
                margin: 0
              }}>
                curare
              </h3>
            </div>

            {/* Navigation Columns */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '80px',
              flex: '1 1 auto'
            }}>
              {/* Column 1: Product */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: '0 0 auto',
                minWidth: '150px'
              }}>
                <h4 style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff', // Headers should be white
                  margin: 0
                }}>
                  Product
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {['Curare for Individuals', 'Curare for Schools', 'Pricing', 'Help & Support'].map((link, idx) => {
                    const isPricing = link === 'Pricing'
                    const isHelpSupport = link === 'Help & Support'
                    if (isPricing) {
                      return (
                        <Link
                          key={idx}
                          to="/pricing"
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: '15px',
                            color: '#d0d1d2', // Links should be #d0d1d2
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {link}
                        </Link>
                      )
                    } else if (isHelpSupport) {
                      return (
                        <Link
                          key={idx}
                          to="/about-us#contact-us"
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: '15px',
                            color: '#d0d1d2', // Links should be #d0d1d2
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {link}
                        </Link>
                      )
                    } else {
                      return (
                        <a
                          key={idx}
                          href="#"
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: '15px',
                            color: '#d0d1d2', // Links should be #d0d1d2
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {link}
                        </a>
                      )
                    }
                  })}
                </div>
              </div>

              {/* Column 2: About Us */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: '0 0 auto',
                minWidth: '150px'
              }}>
                <h4 style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff', // Headers should be white
                  margin: 0
                }}>
                  About Us
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {[
                    { label: 'Mission', hash: 'mission' },
                    { label: 'Our Approach', hash: 'our-approach' },
                    { label: 'Methodology', hash: 'methodology' },
                    { label: 'Research', hash: 'research' },
                    { label: 'FAQs', hash: 'faqs' },
                    { label: 'Contact Us', hash: 'contact-us' }
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      to={`/about-us#${link.hash}`}
                      style={{
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: '15px',
                        color: '#d0d1d2', // Links should be #d0d1d2
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Column 3: Terms & Privacy */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                flex: '0 0 auto',
                minWidth: '150px'
              }}>
                <h4 style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff', // Headers should be white
                  margin: 0
                }}>
                  Terms & Privacy
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <Link
                    to="/terms-of-service"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '15px',
                      color: '#d0d1d2',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Terms
                  </Link>
                  <Link
                    to="/privacypolicy"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '15px',
                      color: '#d0d1d2',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Privacy
                  </Link>
                  <Link
                    to="/terms-of-service#regulatory-compliance"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '15px',
                      color: '#d0d1d2',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Don't Sell or Share My Personal Information
                  </Link>
                </div>

                {/* Social Media Icons */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  {[
                    { name: 'Facebook', icon: '/facebookicon.png', href: 'https://facebook.com/profile.php?id=61582441780279' },
                    { name: 'Instagram', icon: '/instagramicon.png', href: 'https://instagram.com/learnwithcurare' },
                    { name: 'Twitter', icon: '/twittericon.png', href: 'https://x.com/learnwithcurare' },
                    { name: 'YouTube', icon: '/youtubeicon.png', href: 'https://youtube.com/@learnwithcurare' }
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '44px', // 40px * 1.1 = 44px (10% bigger)
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000000',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={social.icon}
                        alt={social.name}
                        draggable={false}
                        style={{
                          width: '26.4px', // 24px * 1.1 = 26.4px (10% bigger)
                          height: '26.4px'
                          // Removed filter - icons should be their natural color (white)
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div style={{
            marginTop: '20px'
          }}>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              color: '#d0d1d2', // Copyright should be #d0d1d2
              margin: 0
            }}>
              © 2026 Curare. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

export default HomePage

