import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseService'
import { setUserAge, initializeCookieConsent, detectUserLocation, setCookieConsent, COOKIE_CATEGORIES, getUserAge } from '../utils/cookieManager'

const Welcome = () => {
  const navigate = useNavigate()
  const [isLightMode, setIsLightMode] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)
  const [signupHover2, setSignupHover2] = useState(false)
  const [signupPressed2, setSignupPressed2] = useState(false)
  const [signupHover3, setSignupHover3] = useState(false)
  const [signupPressed3, setSignupPressed3] = useState(false)
  const [signupHover4, setSignupHover4] = useState(false)
  const [signupPressed4, setSignupPressed4] = useState(false)
  const [signupHover5, setSignupHover5] = useState(false)
  const [signupPressed5, setSignupPressed5] = useState(false)
  const [signupHover6, setSignupHover6] = useState(false)
  const [signupPressed6, setSignupPressed6] = useState(false)
  const [signupHover7, setSignupHover7] = useState(false)
  const [signupPressed7, setSignupPressed7] = useState(false)
  const [signupHover8, setSignupHover8] = useState(false)
  const [signupPressed8, setSignupPressed8] = useState(false)
  const [signupHover9, setSignupHover9] = useState(false)
  const [signupPressed9, setSignupPressed9] = useState(false)
  const [signupHover10, setSignupHover10] = useState(false)
  const [signupPressed10, setSignupPressed10] = useState(false)
  const [createProfileHover, setCreateProfileHover] = useState(false)
  const [createProfilePressed, setCreateProfilePressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [progress, setProgress] = useState(0) // 0 to 10 (0% to 100%)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)
  const [selectedOption2, setSelectedOption2] = useState(null)
  const [hoveredOption2, setHoveredOption2] = useState(null)
  const [selectedOption3, setSelectedOption3] = useState(null)
  const [hoveredOption3, setHoveredOption3] = useState(null)
  const [selectedOption4, setSelectedOption4] = useState(null)
  const [hoveredOption4, setHoveredOption4] = useState(null)
  const [age, setAge] = useState(() => {
    // Don't load age from previous account - always start fresh
    // Default to 50 if no age is set
    return 50
  })
  const [cookieConsent, setCookieConsentState] = useState(null)

  useEffect(() => {
    // Check if user is authenticated - if so, redirect to testsecurev2
    // Only redirect if there's a valid session, don't redirect on errors
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        // Only redirect if we have a valid session with a user
        // Don't redirect on errors or if session is null
        if (!error && session?.user) {
          // User is authenticated, redirect immediately
          navigate('/testsecurev2', { replace: true })
          return
        }
        // If no session or error, stay on welcome page (it's public)
      } catch (err) {
        // On any error, stay on welcome page (it's public)
        console.error('Error checking auth:', err)
      }
    }
    
    checkAuth()
    
    // Prevent manual scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    const checkTheme = () => {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
      setIsLightMode(prefersLight)
    }

    checkTheme()
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    mediaQuery.addEventListener('change', checkTheme)

    // Initialize cookie consent on mount
    const initCookies = async () => {
      const consent = await initializeCookieConsent()
      setCookieConsentState(consent)
    }
    initCookies()

    return () => {
      mediaQuery.removeEventListener('change', checkTheme)
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [navigate])

  // Debug: Log currentPage changes
  useEffect(() => {
    const transformValue = currentPage * 100
    const containerHeight = age >= 13 ? 1100 : 1000
    console.log('currentPage changed to:', currentPage, 'transform will be:', `translateY(-${transformValue}vh)`, 'container height:', `${containerHeight}vh`, 'age:', age)
    console.log('Page 10 visibility:', currentPage > 9 && age >= 13 ? 'hidden' : 'visible')
  }, [currentPage, age])

  const handleContinue = () => {
    setCurrentPage(1)
    setProgress(1) // Update progress by 1/10 (10%)
  }

  const handleContinue2 = () => {
    setCurrentPage(2)
    setProgress(2) // Update progress by 1/10 (20%)
  }

  const handleContinue3 = () => {
    if (selectedOption === null) {
      return // Don't proceed if no option is selected
    }
    setCurrentPage(3)
    setProgress(3) // Update progress by 1/10 (30%)
  }

  const handleContinue4 = () => {
    if (selectedOption2 === null) {
      return // Don't proceed if no option is selected
    }
    setCurrentPage(4)
    setProgress(4) // Update progress by 1/10 (40%)
  }

  const handleContinue5 = () => {
    if (selectedOption3 === null) {
      return // Don't proceed if no option is selected
    }
    setCurrentPage(5)
    setProgress(5) // Update progress by 1/10 (50%)
  }

  const handleContinue6 = () => {
    if (selectedOption4 === null) {
      return // Don't proceed if no option is selected
    }
    setCurrentPage(6)
    setProgress(6) // Update progress by 1/10 (60%)
  }

  const handleContinue7 = () => {
    setCurrentPage(7)
    setProgress(7) // Update progress by 1/10 (70%)
  }

  const handleContinue8 = () => {
    // Store user age for cookie management
    setUserAge(age)
    
    // Always go to Page 9 (Built on trust) - Page 9 is at index 8
    setCurrentPage(8)
    setProgress(prev => {
      console.log('handleContinue8: prev progress was', prev, 'setting to 8')
      return 8 // Set progress to 8/10 (80%)
    })
  }

  const handleContinue9 = async () => {
    // Store user age for cookie management
    setUserAge(age)
    
    // Initialize cookie consent based on age and location
    await initializeCookieConsent()
    
    // If age is under 13, skip Page 10 (Cookie Preferences) and go directly to Page 11
    if (age < 13) {
      setCurrentPage(9) // Page 11 is at index 9 when Page 10 doesn't exist (age < 13)
      setProgress(9) // Update progress to 9/10 (90%) - final page for age < 13
      return
    }
    // If age >= 13, go to Page 10 (Cookie Preferences) - Page 10 is at index 9
    setCurrentPage(9)
    setProgress(9) // Update progress to 9/10 (90%) when entering Page 10
  }

  const handleContinue10 = async () => {
    // Initialize cookie consent (will auto-set based on age/location)
    await initializeCookieConsent()
    
    setCurrentPage(10) // Go to page 11 (Final page) - Page 11 is at index 10
    setProgress(9.8) // Update progress to 9.8/10 (98%) - almost filled
  }

  const handleCreateProfile = async () => {
    // Store responses in sessionStorage (don't save to DB until account is created)
    const welcomeResponses = {
      selectedOption: selectedOption, // Page 3
      selectedOption2: selectedOption2, // Page 4
      selectedOption3: selectedOption3, // Page 5
      selectedOption4: selectedOption4, // Page 6
      age: age // Page 8
    }
    sessionStorage.setItem('welcomeResponses', JSON.stringify(welcomeResponses))
    
    // Show loading screen first
    setIsLoading(true)
    
    // Force a re-render to show loading screen, then navigate
    setTimeout(() => {
      window.location.href = '/auth'
    }, 400) // Delay to ensure loading screen is visible
  }

  const handleGoBack = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      // Update progress based on the page we're going back to
      setProgress(newPage)
    }
  }

  // Calculate adaptive lesson count based on selected option
  const getAdaptiveLessonCount = () => {
    switch (selectedOption4) {
      case 1: return '365'
      case 2: return '730'
      case 3: return '1095'
      case 4: return '1460'
      default: return '_'
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: isLightMode ? '#ffffff' : '#161d25'
    }}>
    <style>{`
      html, body {
        overflow: hidden !important;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      @keyframes float2 {
        0%, 100% {
          transform: rotate(32deg) translateY(0px);
        }
        50% {
          transform: rotate(32deg) translateY(-10px);
        }
      }
      @keyframes float3 {
        0%, 100% {
          transform: rotate(-12deg) translateY(0px);
        }
        50% {
          transform: rotate(-12deg) translateY(-10px);
        }
      }
      @keyframes float3small {
        0%, 100% {
          transform: rotate(18deg) translateY(0px);
        }
        50% {
          transform: rotate(18deg) translateY(-10px);
        }
      }
      @keyframes float4 {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes float5 {
        0%, 100% {
          transform: rotate(-16deg) translateY(0px);
        }
        50% {
          transform: rotate(-16deg) translateY(-10px);
        }
      }
      @keyframes float6 {
        0%, 100% {
          transform: rotate(10deg) translateY(0px);
        }
        50% {
          transform: rotate(10deg) translateY(-10px);
        }
      }
      @keyframes float7 {
        0%, 100% {
          transform: rotate(-8deg) translateY(0px);
        }
        50% {
          transform: rotate(-8deg) translateY(-10px);
        }
      }
      @keyframes float8 {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes float9 {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      @keyframes float12 {
        0%, 100% {
          transform: rotate(-21deg) translateY(0px);
        }
        50% {
          transform: rotate(-21deg) translateY(-10px);
        }
      }
      @keyframes float13 {
        0%, 100% {
          transform: rotate(-153deg) translateY(0px);
        }
        50% {
          transform: rotate(-153deg) translateY(-10px);
        }
      }
    `}</style>
    
    {/* Top Box - Sticky */}
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      backgroundColor: isLightMode ? '#ffffff' : '#161d25',
      zIndex: 1000
    }} />
    
    {/* Shadow at top */}
    <div style={{
      width: '100%',
      height: '40px',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent)',
      position: 'fixed',
      top: '80px',
      left: 0,
      zIndex: 1000,
      pointerEvents: 'none'
    }} />
    
    {/* Progress Bar Container - Fixed width and position, always centered */}
    <div style={{
      position: 'fixed',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1001,
      width: 'calc(100% - 64px)',
      maxWidth: '800px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Back Button - Inside container but absolutely positioned */}
      {currentPage > 0 && (
        <button
          onClick={handleGoBack}
          style={{
            position: 'absolute',
            left: '-30px', // Moved 30px to the left (was '0')
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
            zIndex: 1002
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L6 10L12 16"
              stroke={isLightMode ? '#000000' : '#ffffff'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '8px',
        backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(progress / 10) * 100}%`,
          height: '100%',
          backgroundColor: '#2563eb',
          borderRadius: '2px',
          transition: 'width 0.3s ease',
          maxWidth: '100%'
        }} />
      </div>
    </div>

    {/* Loading Screen */}
    {isLoading && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isLightMode ? '#f9fafb' : '#161d25ff', // Light mode: roadmap loading background, Dark mode: #161d25ff
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Loading content can be added here if needed */}
      </div>
    )}

    {/* Pages Container */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: age >= 13 ? '1100vh' : '1000vh', // 11 pages when age >= 13 (includes Page 10), 10 pages otherwise (Page 10 not rendered)
      transform: `translateY(-${currentPage * 100}vh)`, // When age<13 and currentPage=9: -900vh shows Page 11 (at index 9). When age>=13 and currentPage=10: -1000vh shows Page 11 (at index 10)
      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden' // CRITICAL: Prevent overflow traps
    }}
    >
      {/* Page 1: Personalized */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0
      }}>
        {/* Centered container for welcome group and text */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {/* Welcome4 image - centered where welcome 1,2,3 group was */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginLeft: '-40px',
            marginTop: '-60px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '20px',
              marginTop: '80px'
            }}>
              <img 
                src="/welcome4.svg" 
                alt="Welcome 4" 
                style={{
                  width: '200px',
                  height: 'auto',
                  maxWidth: '100%',
                  animation: 'float4 3s ease-in-out infinite',
                  animationDelay: '0s'
                }}
              />
            </div>
          </div>

          {/* Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '500px',
            gap: '16px',
            marginLeft: '60px'
          }}>
            <h2 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Let's personalize your learning experience
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Set your level, goals and weekly time (amongst other things) to tailor the experience to your learning style. You can change these anytime in settings.
            </p>
            
            {/* Signup button */}
            <button
              onClick={handleContinue}
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
                marginTop: '24px',
                flexShrink: 0,
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={
                  signupPressed
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                }
                alt="Continue"
                style={{
                  height: '56px',
                  width: 'auto',
                  maxHeight: '56px',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Page 2: Medical Professionals */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0
      }}>
        {/* Centered container for welcome group and text */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {/* Welcome images - ungrouped but visually together on the left */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginLeft: '-40px',
            marginTop: '-60px'
          }}>
            {/* Caps row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              gap: '40px',
              marginBottom: '0px',
              marginLeft: '-40px'
            }}>
              <img 
                src="/welcome3.svg" 
                alt="Welcome 3" 
                style={{
                  width: '105px',
                  height: 'auto',
                  maxWidth: '100%',
                  transform: 'rotate(-12deg)',
                  animation: 'float3 3s ease-in-out infinite',
                  animationDelay: '0s',
                  position: 'relative',
                  top: '80px'
                }}
              />
              <img 
                src="/welcome3.svg" 
                alt="Welcome 3 Small" 
                style={{
                  width: '52.5px',
                  height: 'auto',
                  maxWidth: '100%',
                  transform: 'rotate(18deg)',
                  animation: 'float3small 3.5s ease-in-out infinite',
                  animationDelay: '1s',
                  position: 'relative',
                  top: '80px'
                }}
              />
              <img 
                src="/welcome2.svg" 
                alt="Welcome 2" 
                style={{
                  width: '150px',
                  height: 'auto',
                  maxWidth: '100%',
                  transform: 'rotate(32deg)',
                  animation: 'float2 2.5s ease-in-out infinite',
                  animationDelay: '0.5s',
                  position: 'relative',
                  top: '80px'
                }}
              />
            </div>
            {/* Welcome 1 below caps */}
            <img 
              src="/welcome1.svg" 
              alt="Welcome 1" 
              style={{
                width: '120px',
                height: 'auto',
                maxWidth: '100%',
                marginTop: '-20px',
                marginLeft: '80px'
              }}
            />
          </div>

          {/* Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '500px',
            gap: '16px',
            marginLeft: '60px'
          }}>
            <h2 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Our lessons are curated by professionals
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Every module is checked by medical professionals for accuracy and clarity, so you study reliable material that maps to real-world practice.
            </p>
            
            {/* Signup button */}
            <button
              onClick={handleContinue2}
              onMouseEnter={() => setSignupHover2(true)}
              onMouseLeave={() => {
                setSignupHover2(false)
                setSignupPressed2(false)
              }}
              onMouseDown={() => setSignupPressed2(true)}
              onMouseUp={() => setSignupPressed2(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                marginTop: '24px',
                flexShrink: 0,
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={
                  signupPressed2
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover2
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                }
                alt="Continue"
                style={{
                  height: '56px',
                  width: 'auto',
                  maxHeight: '56px',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Page 3: Set the Record */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        paddingTop: '170px',
        paddingBottom: '80px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Welcome 5, 6, 7 images - positioned where welcome 1,2,3 group was */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px',
          marginLeft: '-40px',
          marginTop: '0px'
        }}>
          <img 
            src="/welcomes5.svg" 
            alt="Welcome 5" 
            style={{
              width: '200px',
              height: 'auto',
              maxWidth: '100%',
              animation: 'float5 3s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <img 
            src="/welcomes6.svg" 
            alt="Welcome 6" 
            style={{
              width: '100px',
              height: 'auto',
              maxWidth: '100%',
              animation: 'float6 3.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
          <img 
            src="/welcomes7.svg" 
            alt="Welcome 7" 
            style={{
              width: '100px',
              height: 'auto',
              maxWidth: '100%',
              animation: 'float7 2.5s ease-in-out infinite',
              animationDelay: '1s',
              position: 'relative',
              top: '-40px'
            }}
          />
        </div>

        {/* Header and Text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%',
          gap: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Set the Record
          </h2>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.6'
          }}>
            What are your main priorities on your learning journey?
          </p>
        </div>

        {/* Options List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
          width: '100%',
          marginTop: '20px'
        }}>
          {[
            { id: 1, icon: '/option1.1.svg', text: 'Preparing for a career in healthcare' },
            { id: 2, icon: '/option1.2.svg', text: 'Learning human biology' },
            { id: 3, icon: '/option1.3.svg', text: 'Understanding how my body works' },
            { id: 4, icon: '/option1.4.svg', text: 'Just for fun' },
            { id: 5, icon: '/option1.5.svg', text: 'Something else' }
          ].map((option) => {
            const isSelected = selectedOption === option.id
            const isHovered = hoveredOption === option.id
            
            return (
              <div
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                onMouseEnter={() => setHoveredOption(option.id)}
                onMouseLeave={() => setHoveredOption(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    isSelected 
                      ? '#2563eb'
                      : (isLightMode ? '#d0d1d2' : '#3b4652')
                  }`,
                  backgroundColor: isSelected
                    ? (isLightMode ? '#a8c3ff' : '#051b4c')
                    : isHovered
                    ? (isLightMode ? '#f9f9f9' : '#29323c')
                    : (isLightMode ? '#ffffff' : '#161d25'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img 
                  src={option.icon} 
                  alt={option.text}
                  style={{
                    width: '32px',
                    height: '32px',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  color: isSelected
                    ? '#2563eb'
                    : (isLightMode ? '#000000' : '#ffffff'),
                  flex: 1
                }}>
                  {option.text}
                </span>
              </div>
            )
          })}
        </div>

        {/* Signup button */}
        <button
          onClick={handleContinue3}
          onMouseEnter={() => setSignupHover3(true)}
          onMouseLeave={() => {
            setSignupHover3(false)
            setSignupPressed3(false)
          }}
          onMouseDown={() => setSignupPressed3(true)}
          onMouseUp={() => setSignupPressed3(false)}
          disabled={selectedOption === null}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedOption === null ? 'not-allowed' : 'pointer',
            marginTop: '-6px',
            flexShrink: 0,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedOption === null ? 0.5 : 1
          }}
        >
          <img
            src={
              selectedOption !== null
                ? (signupPressed3
                    ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                    : signupHover3
                    ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                    : isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg')
                : (signupPressed3
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover3
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg')
            }
            alt="Continue"
            style={{
              height: '56px',
              width: 'auto',
              maxHeight: '56px',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Page 4: Where did you hear about us? */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        paddingTop: '170px',
        paddingBottom: '80px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Welcome 8 and 9 images - welcome9 behind welcome8, overlapping slightly */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px',
          marginLeft: '-40px',
          marginTop: '0px',
          position: 'relative'
        }}>
          <img 
            src="/welcome9.svg" 
            alt="Welcome 9" 
            style={{
              width: '200px',
              height: 'auto',
              maxWidth: '100%',
              position: 'relative',
              zIndex: 2,
              marginRight: '-100px', // Overlap more
              marginTop: '-20px', // Position welcome9 above welcome8
              animation: 'float9 3s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <img 
            src="/welcome8.svg" 
            alt="Welcome 8" 
            style={{
              width: '200px',
              height: 'auto',
              maxWidth: '100%',
              position: 'relative',
              zIndex: 1,
              animation: 'float8 3.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }}
          />
        </div>

        {/* Header and Text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%',
          gap: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Where did you hear about us?
          </h2>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Help us understand how people discover Curare.
          </p>
        </div>

        {/* Options List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
          width: '100%',
          marginTop: '20px'
        }}>
          {[
            { id: 1, icon: '/option2.1.svg', text: 'Friends or Family' },
            { id: 2, icon: '/option2.2.svg', text: 'YouTube' },
            { id: 3, icon: '/option2.3.svg', text: 'Instagram / Facebook' },
            { id: 4, icon: '/option2.4.svg', text: 'Browser / Search' },
            { id: 5, icon: '/option1.5.svg', text: 'Something else' }
          ].map((option) => {
            const isSelected = selectedOption2 === option.id
            const isHovered = hoveredOption2 === option.id
            
            return (
              <div
                key={option.id}
                onClick={() => setSelectedOption2(option.id)}
                onMouseEnter={() => setHoveredOption2(option.id)}
                onMouseLeave={() => setHoveredOption2(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    isSelected 
                      ? '#2563eb'
                      : (isLightMode ? '#d0d1d2' : '#3b4652')
                  }`,
                  backgroundColor: isSelected
                    ? (isLightMode ? '#a8c3ff' : '#051b4c')
                    : isHovered
                    ? (isLightMode ? '#f9f9f9' : '#29323c')
                    : (isLightMode ? '#ffffff' : '#161d25'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img 
                  src={option.icon} 
                  alt={option.text}
                  style={{
                    width: '32px',
                    height: '32px',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  color: isSelected
                    ? '#2563eb'
                    : (isLightMode ? '#000000' : '#ffffff'),
                  flex: 1
                }}>
                  {option.text}
                </span>
              </div>
            )
          })}
        </div>

        {/* Signup button */}
        <button
          onClick={handleContinue4}
          onMouseEnter={() => setSignupHover4(true)}
          onMouseLeave={() => {
            setSignupHover4(false)
            setSignupPressed4(false)
          }}
          onMouseDown={() => setSignupPressed4(true)}
          onMouseUp={() => setSignupPressed4(false)}
          disabled={selectedOption2 === null}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedOption2 === null ? 'not-allowed' : 'pointer',
            marginTop: '-6px',
            marginBottom: '80px',
            flexShrink: 0,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedOption2 === null ? 0.5 : 1
          }}
        >
          <img
            src={
              selectedOption2 !== null
                ? (signupPressed4
                    ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                    : signupHover4
                    ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                    : isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg')
                : (signupPressed4
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover4
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg')
            }
            alt="Continue"
            style={{
              height: '56px',
              width: 'auto',
              maxHeight: '56px',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Page 5: Your turn */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        paddingTop: '150px', // Moved down by 30px (was 120px)
        paddingBottom: '80px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Header and Text - centered */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%',
          gap: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Your turn
          </h2>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.6',
            textAlign: 'right',
            width: '100%'
          }}>
            Pick the unit that matches your current knowledge. You can change them later if you need to.
          </p>
        </div>

        {/* Options - Two rectangular cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '20px',
          maxWidth: '800px',
          width: '100%',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
          {/* Premed Option */}
          <div
            onClick={() => setSelectedOption3(1)}
            onMouseEnter={() => setHoveredOption3(1)}
            onMouseLeave={() => setHoveredOption3(null)}
            style={{
              flex: 1,
              maxWidth: '400px',
              borderRadius: '12px',
              border: `2px solid ${
                selectedOption3 === 1
                  ? '#2563eb'
                  : (isLightMode ? '#d0d1d2' : '#3b4652')
              }`,
              backgroundColor: selectedOption3 === 1
                ? (isLightMode ? '#a8c3ff' : '#051b4c')
                : hoveredOption3 === 1
                ? (isLightMode ? '#f9f9f9' : '#29323c')
                : (isLightMode ? '#ffffff' : '#161d25'),
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              gap: '16px'
            }}
          >
            {/* Icon at top half */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px',
              marginBottom: '8px'
            }}>
              <img 
                src="/premed.svg" 
                alt="Premed"
                style={{
                  width: '120px',
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </div>
            
            {/* Text content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: selectedOption3 === 1
                  ? '#2563eb'
                  : (isLightMode ? '#000000' : '#ffffff'),
                margin: 0
              }}>
                Premed
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: selectedOption3 === 1
                  ? '#2563eb'
                  : (isLightMode ? '#000000' : '#ffffff'),
                margin: 0,
                lineHeight: '1.5'
              }}>
                I'm building a foundation in biology and chemistry.
              </p>
            </div>
          </div>

          {/* Med Option - Unselectable */}
          <div
            onClick={() => {}} // Disabled - cannot be selected
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            style={{
              flex: 1,
              maxWidth: '400px',
              borderRadius: '12px',
              border: `2px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`,
              backgroundColor: isLightMode ? '#f5f5f5' : '#1a1f28',
              cursor: 'not-allowed',
              opacity: 0.6,
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              gap: '16px'
            }}
          >
            {/* Icon at top half */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '120px',
              marginBottom: '8px'
            }}>
              <img 
                src="/med.svg" 
                alt="Med"
                style={{
                  width: '120px',
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </div>
            
            {/* Text content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 700,
                color: selectedOption3 === 2
                  ? '#2563eb'
                  : (isLightMode ? '#000000' : '#ffffff'),
                margin: 0
              }}>
                Med
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: selectedOption3 === 2
                  ? '#2563eb'
                  : (isLightMode ? '#000000' : '#ffffff'),
                margin: 0,
                lineHeight: '1.5'
              }}>
                I understand the basics of disease and diagnostics.
              </p>
            </div>
          </div>
        </div>

        {/* Signup button */}
        <button
          onClick={handleContinue5}
          onMouseEnter={() => setSignupHover5(true)}
          onMouseLeave={() => {
            setSignupHover5(false)
            setSignupPressed5(false)
          }}
          onMouseDown={() => setSignupPressed5(true)}
          onMouseUp={() => setSignupPressed5(false)}
          disabled={selectedOption3 === null}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedOption3 === null ? 'not-allowed' : 'pointer',
            marginTop: '20px',
            marginBottom: '80px',
            flexShrink: 0,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedOption3 === null ? 0.5 : 1
          }}
        >
          <img
            src={
              selectedOption3 !== null
                ? (signupPressed5
                    ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                    : signupHover5
                    ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                    : isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg')
                : (signupPressed5
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover5
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg')
            }
            alt="Continue"
            style={{
              height: '56px',
              width: 'auto',
              maxHeight: '56px',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Page 6: Set your daily learning goal */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        paddingTop: '170px',
        paddingBottom: '80px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Welcome10 image */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          marginLeft: '-40px',
          marginTop: '0px'
        }}>
          <img 
            src="/welcome10.svg" 
            alt="Welcome 10" 
            style={{
              width: '200px',
              height: 'auto',
              maxWidth: '100%',
              transform: 'rotate(-11deg)'
            }}
          />
        </div>

        {/* Header and Text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%',
          gap: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.2'
          }}>
            Set your daily learning goal
          </h2>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.6'
          }}>
            By the end of the year, you would have completed a total of{' '}
            <span style={{
              fontWeight: 700,
              color: '#2563eb'
            }}>
              {getAdaptiveLessonCount()}
            </span>
            {' '}lessons!
          </p>
        </div>

        {/* Options List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
          width: '100%',
          marginTop: '20px'
        }}>
          {[
            { id: 1, icon: '/option3.1.svg', text: '5 Minutes' },
            { id: 2, icon: '/option3.2.svg', text: '10 Minutes' },
            { id: 3, icon: '/option3.3.svg', text: '15 Minutes' },
            { id: 4, icon: '/option3.4.svg', text: '20 Minutes' }
          ].map((option) => {
            const isSelected = selectedOption4 === option.id
            const isHovered = hoveredOption4 === option.id
            
            return (
              <div
                key={option.id}
                onClick={() => setSelectedOption4(option.id)}
                onMouseEnter={() => setHoveredOption4(option.id)}
                onMouseLeave={() => setHoveredOption4(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `2px solid ${
                    isSelected 
                      ? '#2563eb'
                      : (isLightMode ? '#d0d1d2' : '#3b4652')
                  }`,
                  backgroundColor: isSelected
                    ? (isLightMode ? '#a8c3ff' : '#051b4c')
                    : isHovered
                    ? (isLightMode ? '#f9f9f9' : '#29323c')
                    : (isLightMode ? '#ffffff' : '#161d25'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <img 
                  src={option.icon} 
                  alt={option.text}
                  style={{
                    width: '32px',
                    height: '32px',
                    flexShrink: 0
                  }}
                />
                <span style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400,
                  color: isSelected
                    ? '#2563eb'
                    : (isLightMode ? '#000000' : '#ffffff'),
                  flex: 1
                }}>
                  {option.text}
                </span>
              </div>
            )
          })}
        </div>

        {/* Signup button */}
        <button
          onClick={handleContinue6}
          onMouseEnter={() => setSignupHover6(true)}
          onMouseLeave={() => {
            setSignupHover6(false)
            setSignupPressed6(false)
          }}
          onMouseDown={() => setSignupPressed6(true)}
          onMouseUp={() => setSignupPressed6(false)}
          disabled={selectedOption4 === null}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: selectedOption4 === null ? 'not-allowed' : 'pointer',
            marginTop: '-6px',
            marginBottom: '80px',
            flexShrink: 0,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: selectedOption4 === null ? 0.5 : 1
          }}
        >
          <img
            src={
              selectedOption4 !== null
                ? (signupPressed6
                    ? isLightMode ? '/signupfilledpressed(light).svg' : '/signupfilledpressed.svg'
                    : signupHover6
                    ? isLightMode ? '/signupfilledhover(light).svg' : '/signupfilledhover.svg'
                    : isLightMode ? '/signupfilleddefault(light).svg' : '/signupfilleddefault.svg')
                : (signupPressed6
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover6
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg')
            }
            alt="Continue"
            style={{
              height: '56px',
              width: 'auto',
              maxHeight: '56px',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Page 7: Getting better, step by step */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        {/* Centered container for welcome image and text */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {/* Welcome11 image */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            marginLeft: '-40px',
            marginTop: '-60px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '20px',
              marginTop: '80px'
            }}>
              <img 
                src="/welcome11.svg" 
                alt="Welcome 11" 
                style={{
                  width: '200px',
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </div>
          </div>

          {/* Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '500px',
            gap: '16px',
            marginLeft: '60px'
          }}>
            <h2 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Getting better, step by step
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.6'
            }}>
              We help you stay consistent with short lessons, practice questions, and reminders built around you.
            </p>
            
            {/* Signup button */}
            <button
              onClick={handleContinue7}
              onMouseEnter={() => setSignupHover7(true)}
              onMouseLeave={() => {
                setSignupHover7(false)
                setSignupPressed7(false)
              }}
              onMouseDown={() => setSignupPressed7(true)}
              onMouseUp={() => setSignupPressed7(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                marginTop: '24px',
                flexShrink: 0,
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={
                  signupPressed7
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover7
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                }
                alt="Continue"
                style={{
                  height: '56px',
                  width: 'auto',
                  maxHeight: '56px',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Page 8: How old are you? */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '20px',
        paddingTop: '230px',
        paddingBottom: '80px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        {/* Header and Text */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          width: '100%',
          gap: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: "'Unbounded', sans-serif",
            fontSize: '32px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : '#ffffff',
            margin: 0,
            lineHeight: '1.2'
          }}>
            How old are you?
          </h2>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: isLightMode ? '#d0d1d2' : '#3b4652',
            margin: 0,
            lineHeight: '1.6'
          }}>
            Users under 13 only receive essential cookies by default.
          </p>
        </div>

        {/* Slider Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '800px',
          marginTop: '80px',
          gap: '40px',
          position: 'relative'
        }}>
          {/* Dialogue Box with Age Counter - positioned above slider, following thumb */}
          <div style={{
            position: 'absolute',
            top: '-80px',
            left: `calc(17.5% + ${(age / 100) * 65}%)`,
            transform: 'translateX(-50%)',
            marginBottom: '20px',
            transition: 'left 0.1s ease'
          }}>
            <div style={{
              position: 'relative',
              padding: '12px 20px',
              backgroundColor: isLightMode ? '#ffffff' : '#161d25',
              border: `2px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`,
              borderRadius: '12px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#2563eb',
                fontFamily: "'Inter Tight', sans-serif"
              }}>
                {age}
              </div>
            </div>
            {/* Triangle pointer */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `8px solid ${isLightMode ? '#ffffff' : '#161d25'}`
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: `9px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`
            }} />
          </div>

          {/* Slider Track */}
          <div style={{
            position: 'relative',
            width: '65%',
            height: '20px',
            backgroundColor: '#2563eb',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '0 auto'
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
            const newAge = Math.round(percentage)
            setAge(newAge)
          }}
          >
            {/* Highlight effect */}
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              right: '3px',
              height: '8px',
              backgroundColor: '#5e8ef7',
              borderRadius: '2px'
            }} />
            
            {/* Slider Thumb */}
            <div
              style={{
                position: 'absolute',
                left: `${(age / 100) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: isLightMode ? '#ffffff' : '#161d25',
                border: `2px solid ${isLightMode ? '#d0d1d2' : '#3b4652'}`,
                cursor: 'grab',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                transition: 'left 0.1s ease'
              }}
              onMouseDown={(e) => {
                e.preventDefault()
                const startX = e.clientX
                const startAge = age
                const trackWidth = e.currentTarget.parentElement.offsetWidth

                const handleMouseMove = (moveEvent) => {
                  const deltaX = moveEvent.clientX - startX
                  const deltaAge = (deltaX / trackWidth) * 100
                  const newAge = Math.max(0, Math.min(100, Math.round(startAge + deltaAge)))
                  setAge(newAge)
                }

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
            />
          </div>
        </div>

        {/* Signup button */}
        <button
          onClick={handleContinue8}
          onMouseEnter={() => setSignupHover8(true)}
          onMouseLeave={() => {
            setSignupHover8(false)
            setSignupPressed8(false)
          }}
          onMouseDown={() => setSignupPressed8(true)}
          onMouseUp={() => setSignupPressed8(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            marginTop: '70px',
            flexShrink: 0,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={
              signupPressed8
                ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                : signupHover8
                ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
            }
            alt="Continue"
            style={{
              height: '56px',
              width: 'auto',
              maxHeight: '56px',
              display: 'block'
            }}
          />
        </button>
      </div>

      {/* Page 9: Built on trust */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '20px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}>
        {/* Centered container for welcome images and text */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '60px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          {/* Welcome12 and Welcome13 images */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: '20px',
            marginLeft: '-40px',
            marginTop: '-60px'
          }}>
            <img 
              src="/welcome12.svg" 
              alt="Welcome 12" 
              style={{
                width: '200px',
                height: 'auto',
                maxWidth: '100%',
                transform: 'rotate(-21deg)',
                animation: 'float12 3s ease-in-out infinite',
                animationDelay: '0s'
              }}
            />
            <img 
              src="/welcome13.svg" 
              alt="Welcome 13" 
              style={{
                width: '200px',
                height: 'auto',
                maxWidth: '100%',
                transform: 'rotate(-153deg)',
                animation: 'float13 3.5s ease-in-out infinite',
                animationDelay: '0.5s',
                marginTop: '20px'
              }}
            />
          </div>

          {/* Text content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            maxWidth: '500px',
            gap: '16px',
            marginLeft: '60px'
          }}>
            <h2 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Built on trust
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Your data is handled securely, and our medical content is reviewed and sourced from established, reliable references.
            </p>
            
            {/* Signup button */}
            <button
              onClick={handleContinue9}
              onMouseEnter={() => setSignupHover9(true)}
              onMouseLeave={() => {
                setSignupHover9(false)
                setSignupPressed9(false)
              }}
              onMouseDown={() => setSignupPressed9(true)}
              onMouseUp={() => setSignupPressed9(false)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                marginTop: '24px',
                flexShrink: 0,
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={
                  signupPressed9
                    ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                    : signupHover9
                    ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                    : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                }
                alt="Continue"
                style={{
                  height: '56px',
                  width: 'auto',
                  maxHeight: '56px',
                  display: 'block'
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Page 10: Cookie Preferences - Only shown if age >= 13 */}
      {age >= 13 && (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex', // Always in layout to maintain space
          visibility: currentPage > 9 ? 'hidden' : 'visible', // Hide but keep space when past Page 10
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          gap: '20px',
          position: 'relative',
          backgroundColor: isLightMode ? '#ffffff' : '#161d25',
          flexShrink: 0,
          boxSizing: 'border-box',
          overflow: 'hidden' // CRITICAL: Prevent overflow traps
        }}>
          {/* Centered container for welcome image and text */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            maxWidth: '1200px',
            width: '100%'
          }}>
            {/* Welcome14 image on the left */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              marginLeft: '-40px',
              marginTop: '-60px'
            }}>
              <img 
                src={isLightMode ? '/welcome14(light).svg' : '/welcome14.svg'} 
                alt="Welcome 14" 
                style={{
                  width: '200px',
                  height: 'auto',
                  maxWidth: '100%'
                }}
              />
            </div>

            {/* Text content on the right */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              maxWidth: '500px',
              gap: '16px',
              marginLeft: '60px'
            }}>
              <h2 style={{
                fontFamily: "'Unbounded', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                color: isLightMode ? '#000000' : '#ffffff',
                margin: 0,
                lineHeight: '1.2'
              }}>
                Cookie Preferences
              </h2>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: isLightMode ? '#000000' : '#ffffff',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Cookies help keep us secure and improve your experience. By continuing, you agree to the use of cookies as described in our Privacy Policy. You can change these anytime in Settings.
              </p>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: isLightMode ? '#000000' : '#ffffff',
                margin: 0,
                lineHeight: '1.6',
                marginTop: '8px'
              }}>
                Analytical & Marketing Cookies are automatically disabled in the EU/UK upon account creation.
              </p>
              
              {/* Cookie Options */}
              {cookieConsent && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  marginTop: '24px',
                  width: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0'
                  }}>
                    <span style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '16px',
                      fontWeight: 400,
                      color: isLightMode ? '#000000' : '#ffffff'
                    }}>
                      Analytical Cookies
                    </span>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '44px',
                      height: '24px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={cookieConsent.analytical}
                        onChange={(e) => {
                          const newConsent = { ...cookieConsent, analytical: e.target.checked }
                          setCookieConsent(newConsent)
                          setCookieConsentState(newConsent)
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: cookieConsent.analytical ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'),
                        borderRadius: '12px',
                        transition: 'background-color 0.2s ease'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: cookieConsent.analytical ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </label>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0'
                  }}>
                    <span style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '16px',
                      fontWeight: 400,
                      color: isLightMode ? '#000000' : '#ffffff'
                    }}>
                      Marketing Cookies
                    </span>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '44px',
                      height: '24px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={cookieConsent.marketing}
                        onChange={(e) => {
                          const newConsent = { ...cookieConsent, marketing: e.target.checked }
                          setCookieConsent(newConsent)
                          setCookieConsentState(newConsent)
                        }}
                        style={{ display: 'none' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: cookieConsent.marketing ? '#2563eb' : (isLightMode ? '#d0d1d2' : '#3b4652'),
                        borderRadius: '12px',
                        transition: 'background-color 0.2s ease'
                      }} />
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: cookieConsent.marketing ? '22px' : '2px',
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#ffffff',
                        borderRadius: '50%',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </label>
                  </div>
                </div>
              )}
              
              {/* Signup button */}
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Ensure cookie consent is saved
                  if (cookieConsent) {
                    await setCookieConsent(cookieConsent)
                  }
                  handleContinue10()
                }}
                onMouseEnter={() => setSignupHover10(true)}
                onMouseLeave={() => {
                  setSignupHover10(false)
                  setSignupPressed10(false)
                }}
                onMouseDown={() => setSignupPressed10(true)}
                onMouseUp={() => setSignupPressed10(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  marginTop: '24px',
                  flexShrink: 0,
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={
                    signupPressed10
                      ? isLightMode ? '/signuppressed(light).svg' : '/signuppressed.svg'
                      : signupHover10
                      ? isLightMode ? '/signuphover(light).svg' : '/signuphover.svg'
                      : isLightMode ? '/signupdefault(light).svg' : '/signupdefault.svg'
                  }
                  alt="Continue"
                  style={{
                    height: '56px',
                    width: 'auto',
                    maxHeight: '56px',
                    display: 'block'
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page 11: Final Page - Your learning journey starts here */}
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        gap: '40px',
        position: 'relative',
        backgroundColor: isLightMode ? '#ffffff' : '#161d25',
        flexShrink: 0,
        boxSizing: 'border-box',
        overflow: 'hidden', // CRITICAL: Prevent overflow traps
        minHeight: '100vh', // Ensure it takes full height
        maxHeight: '100vh' // Prevent overflow
      }}>
        {/* Welcome15 image - centered, moved up a bit */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-60px'
        }}>
          <img 
            src="/welcome15.svg" 
            alt="Welcome 15" 
            style={{
              width: '200px',
              height: 'auto',
              maxWidth: '100%',
              display: 'block'
            }}
          />
        </div>

        {/* Header text - Unbounded font */}
        <h2 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '32px',
          fontWeight: 700,
          color: isLightMode ? '#000000' : '#ffffff',
          margin: 0,
          lineHeight: '1.2',
          textAlign: 'center'
        }}>
          Your learning journey starts here.
        </h2>

        {/* Create a free profile button - same size as MCQ button (533.33px) */}
        <button
          type="button"
          onClick={handleCreateProfile}
          onMouseEnter={() => setCreateProfileHover(true)}
          onMouseLeave={() => {
            setCreateProfileHover(false)
            setCreateProfilePressed(false)
          }}
          onMouseDown={() => setCreateProfilePressed(true)}
          onMouseUp={() => setCreateProfilePressed(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            width: '533.33px', // Same size as MCQ button
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={
              createProfilePressed
                ? isLightMode ? '/createafreeprofilepressed(light).svg' : '/createafreeprofilepressed.svg'
                : createProfileHover
                ? isLightMode ? '/createafreeprofilehover(light).svg' : '/createafreeprofilehover.svg'
                : isLightMode ? '/createafreeprofiledefault(light).svg' : '/createafreeprofiledefault.svg'
            }
            alt="Create a free profile"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </button>
      </div>
    </div>
    </div>
  )
}

export default Welcome
