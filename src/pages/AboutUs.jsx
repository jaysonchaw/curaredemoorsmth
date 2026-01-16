import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const AboutUs = () => {
  const [showNavLine, setShowNavLine] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowNavLine(true)
      } else {
        setShowNavLine(false)
      }
    }

    // Set background to white for about us page
    document.body.style.backgroundColor = '#ffffff'
    document.documentElement.style.backgroundColor = '#ffffff'

    // Function to scroll to section
    const scrollToSection = () => {
      const hash = location.hash || window.location.hash
      if (hash) {
        const sectionId = hash.substring(1)
        const element = document.getElementById(sectionId)
        if (element) {
          const yOffset = -150 // Account for fixed nav bar
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      } else {
        // If no hash, scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    // Scroll to hash if present on mount or location change
    const hash = location.hash || window.location.hash
    if (hash) {
      // Wait for DOM to be ready
      setTimeout(scrollToSection, 200)
    } else {
      // Scroll to top if no hash
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }

    // Handle hash changes
    const handleHashChange = () => {
      setTimeout(scrollToSection, 100)
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [location])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      width: '100%'
    }}>
      {/* Sticky Nav Bar - Fixed overlay, doesn't push content */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        zIndex: 1000,
        width: '100%'
      }}>
        <div style={{
          height: '83px',
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 250px'
        }}>
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#2563eb',
              textDecoration: 'none'
            }}
          >
            curare
          </Link>

          {/* Signup Button */}
          <button
            type="button"
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
              transform: 'translateX(120px)'
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

      <article style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '150px 40px 80px'
      }}>
        {/* Date */}
        <p style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          January 3, 2026.
        </p>

        {/* Main Header */}
        <h1 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '48px',
          fontWeight: 400,
          color: '#000000',
          margin: '0 0 24px 0',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          About Us
        </h1>

        {/* Header Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <img
            src="/aboutus.svg"
            alt="About Us"
            style={{
              width: '100%',
              maxWidth: '600px',
              height: 'auto'
            }}
          />
        </div>

        {/* Content */}
        <div style={{
          marginTop: '60px'
        }}>
          {/* Mission Section */}
          <section id="mission" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Mission
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              <strong>We prioritize learning</strong>
            </p>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              Curare helps students build an understanding of human biology and medicine through short, visual lessons and hands-on exercises. We focus on clarity, not clutter. Lessons map to school topics and extend knowledge so learners can apply what they know in class and beyond.
            </p>
          </section>

          {/* Our Approach Section */}
          <section id="our-approach" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Our approach
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              We teach by doing, not by dumping content and expecting you to learn it. We've created a library of micro lessons that focus on one causal idea at a time, visual exercises that force a prediction before showing the answer, and much more. We make sure to tweak and fine-tune our content to spark interest in medicine, whilst being as accurate and safe as possible.
            </p>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              We're also classroom-friendly, since our content was designed to fit into biology curricula in secondary schooling.
            </p>
          </section>

          {/* Methodology Section */}
          <section id="methodology" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Methodology
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 12px 0'
              }}>
                Simple & Usable
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                One idea per screen. Only one. Complex systems are broken into single relationships so learners can predict and verify. We use active recall + feedback. Every activity requires a choice or prediction, then immediate feedback and an explanation. Lessons adapt to what the learner gets wrong so that weak spots get repeated at the right time.
              </p>
            </div>
          </section>

          {/* Research Section */}
          <section id="research" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Research
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              We base sequencing and examples on standard premed topics and scaffolded progression. The curriculum covers fundamentals like cells, blood and immunity, heart and circulation, digestion, hormones, and more. Lesson modules are designed so each unit builds on the last. See the lesson outlines for full scope.
            </p>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              We run A/B tests on exercise phrasing to improve retention, collect anonymized learning curve data to optimize spacing for each concept, and partner with tutors and homeschool groups to validate classroom fit.
            </p>
          </section>

          {/* FAQs Section */}
          <section id="faqs" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              FAQs
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                Q: Should I upgrade?
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                A: No. At this current moment, we're facing issues with our paid plan and features. We will announce the release of our 'Pro Plan' soon, once we finish optimizing user experience. The paid plan will include new content, more interactive question types, offline learning, endless retries, and much more.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                Q: Is my progress saved across devices?
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                A: Yes. Progress is tied to your account so you can continue on any device once you are signed in.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                Q: Are lessons reviewed by experts?
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                A: All medical content is checked against reliable references and reviewed before release. We cite sources internally and update lessons when new evidence or feedback suggests improvement.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 8px 0'
              }}>
                Q: Are there any concerns about misdiagnosis?
              </h3>
              <p style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: '#000000',
                margin: '0 0 16px 0',
                lineHeight: '1.6'
              }}>
                A: No. We strongly condone any "predictions" or "diagnoses" in our lessons, instead focusing on helping learners with medical knowledge, practices, and biology.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact-us" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Contact us
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              Email: <a href="mailto:curareofficial@gmail.com" style={{ color: '#2563eb', textDecoration: 'underline' }}>curareofficial@gmail.com</a>
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}

export default AboutUs
