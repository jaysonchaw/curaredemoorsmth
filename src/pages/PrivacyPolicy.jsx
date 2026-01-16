import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const PrivacyPolicy = () => {
  const [showNavLine, setShowNavLine] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowNavLine(true)
      } else {
        setShowNavLine(false)
      }
    }

    // Set background to white for privacy policy page
    document.body.style.backgroundColor = '#ffffff'
    document.documentElement.style.backgroundColor = '#ffffff'

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

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
          height: '83px', // 64px * 1.3 = 83.2px (30% taller)
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 250px' // Keep original padding
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
        padding: '150px 40px 80px' // Increased top padding to account for fixed nav
      }}>
        {/* Effective Date */}
        <p style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          January 1, 2026.
        </p>

        {/* Main Header */}
        <h1 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '48px',
          fontWeight: 400, // Unbounded unbolded
          color: '#000000',
          margin: '0 0 24px 0',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          Privacy Policy
        </h1>

        {/* Header Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <img
            src="/privacypolicy.svg"
            alt="Privacy Policy"
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
          {/* INTRODUCTION */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700, // Inter Tight bolded
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Introduction
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400, // Inter Tight unbolded
              color: '#000000',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              This Privacy Policy explains how our medical-education Service (the "Service") collects, uses, and protects user information. Curare offers simplified anatomical illustrations and educational content. The owner/operator is a minor and not a medical professional; all content is provided for learning only and not as medical advice. Your use of Service indicates acceptance of this Policy. We prioritize user safety and privacy, and we comply with applicable laws worldwide (including COPPA, GDPR, etc.) in handling personal data.
            </p>
          </section>

          {/* INFORMATION COLLECTED */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Information Collected
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Registration Data:</strong> When you register an account, you may provide your personal information such as your name, email address, and a password. This is collected only if you choose to create an account. We do not require sensitive health or financial information.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Technical and Device Data:</strong> We automatically collect certain technical information about your device and use of Service. This may include IP address, browser type, operating system, and domain server. This data is used to analyze trends and administer the Service. It is anonymous and does not include personal content.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Usage and Engagement Data:</strong> We collect data on how you use the Service. This can include pages you visit, time spent on each lesson, and lesson completion logs. For example, we record which lessons are completed by a user, and how long users spend on each page to improve the educational experience. We do not collect any medical histories of diagnoses of users.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Communications:</strong> If you contact us (e.g. via email), we may keep records of that correspondence to respond to your inquiries or provide support.
              </p>
            </div>
          </section>

          {/* USE OF INFORMATION */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Use of Information
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We use collected information only as described here:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Provide and Personalize the Service:</strong> We use your data to enable your account, authentic sessions, and deliver the lessons or features you request. For example, login credentials and session cookies keep you logged in across pages.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Improve the Service:</strong> We analyze usage and performance data to improve content, fix errors, and develop new features. Aggregate analytics (like page view statistics and user progress metrics) help us understand how the Service is used and how to enhance it.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Security and Anti-Fraud:</strong> We use information (including CSRF tokens in cookies) to secure the Service and protect against attacks or misuse. This helps prevent unauthorized access and cross-site request forgery.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Communication:</strong> We may send you service-related messages (such as updates to the Service or this policy) and respond to your requests or questions.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- No Selling of Personal Data:</strong> We do not rent, sell, or trade your personal information to third parties.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Service Providers and Law Enforcement:</strong> We may share data with trusted third-party providers who assist with the Service (such as web hosting, payment processors, or analytics vendors); they use your data only to the extent needed to perform their tasks. We may also disclose information if required by law or to protect the rights or safety of users or others.
              </p>
            </div>
          </section>

          {/* COOKIES */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Cookies
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We use cookies and similar technologies to support the Service. A cookie is a small data file stored on your device. We use essential cookies and similar technologies to operate accounts, maintain sessions, and provide core functionality. These cookies are set automatically when an account is created or accessed. Users may manage or disable cookies through their account settings or browser controls; however, disabling certain cookies may affect the availability or functionality of the Service. Check our Terms for more details on Cookie Implementation. The types of cookies we use include:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Session and Security Cookies:</strong> Essential cookies maintain your authenticated session (so you stay logged in) and secure the Service. For example, login cookies mark your session status as you browse. We also use CSRF token cookie to prevent cross-site request forgery attacks. These cookies are necessary for security and cannot be disabled without affecting login or other features.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Load Balancing Cookies:</strong> To ensure reliability and performance, we use cookies that route your requests to specific servers. For instance, AWS load-balancer cookies (like AWSALB) direct traffic among multiple servers. This is standard practice to distribute load and maintain fast response times.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Analytics and Performance Cookies:</strong> We use cookies to measure site usage and engagement. For example, we may use Google Analytics cookies to count page views and record metrics like time spent on each page and click events. We track how users move through lessons (including drop-off points and completion times) in order to improve the learning content. All analytical data is used in aggregate; meaning it does not identify individual users.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Cookie Management:</strong> You can control cookies through your browser settings. Disabling certain cookies (especially essential ones) may prevent parts of the Service from functioning properly. For privacy, you can disable or delete non-essential cookies in our settings menu or your browser settings, though we recommend keeping necessary cookies enabled for best performance.
              </p>
            </div>
          </section>

          {/* LEGAL DISCLAIMER */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Legal Disclaimer
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Medical Disclaimer:</strong> The information on this site is provided for informational and education purposes only. We are not healthcare professionals, and our illustrations are intentionally simplified and not medically accurate. This content is not a substitute for professional medical advice, diagnosis, or treatment. Do not attempt to self-diagnose or treat a health issue based on this site. Always consult a qualified healthcare provider for any medical concerns. In particular, if you experience a medical emergency, seek immediate professional care and do not rely on this site. By using the site, you acknowledge that we are not responsible for the use or misuse of the information provided.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Liability:</strong> You assume full responsibility for using the information on this site. We expressly disclaim any liability for claims, losses, or damages arising from its use.
              </p>
            </div>
          </section>

          {/* INTERNATIONAL COMPLIANCE */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              International Compliance
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                Our privacy practices meet various international standards:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- COPPA (U.S. Children's Privacy):</strong> In the United States, the Children's Online Privacy Protection Act applies to the online collection of information from children under 13. We do not knowingly collect personal data without verified parental consent. If we learn that such data has been collected, we will take steps to delete it immediately. Parents have the right to review or delete their child's information as required by COPPA.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- GDPR (EU/EEA/UK):</strong> For users in the European Union, European Economic Area, or the UK, we comply with the General Data Protection Regulation. EU residents have rights over their personal data (see "User Rights" below). We handle EU personal data lawfully and securely, and we follow GDPR requirements on data protection and breach notification.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Other Laws:</strong> We also observe other applicable laws (e.g. California's privacy laws, Canada's PIPEDA, etc.) to the extent that they apply. We update our practices as needed to stay compliant with global data-protection standards.
              </p>
            </div>
          </section>

          {/* USER RIGHTS */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              User Rights
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                You have rights regarding your personal data as provided by applicable law:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Access:</strong> You may request information about the personal data we hold about you and obtain a copy of it.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Correction (Rectification):</strong> You can request corrections to any incomplete or inaccurate personal data we have.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Deletion (Erasure):</strong> You can request that we delete your personal data from our systems, subject to legal requirements and our need to retain certain data for legitimate purposes.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Consent Withdrawal:</strong> If we process your data based on content, you have the right to withdraw that consent at any time. This will not affect the lawfulness of prior processing.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Data Portability:</strong> You can ask for your personal data in a structured, commonly used, machine-readable format, and request transmission of that data to another controller if technically feasible.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Object or Restrict:</strong> You may object to or request restriction of certain data processing (e.g. direct marketing or other specific uses) as allowed by law.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Parental Rights:</strong> If you are a parent or guardian of a child under 13, you have the right to review and delete that child's personal information in our records. (See COPPA compliance above.)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                To exercise your right, please contact us (see below). We will respond in accordance with applicable laws. EU users can also lodge a complaint with their data protection authority if needed.
              </p>
            </div>
          </section>

          {/* DATA RETENTION */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Data Retention
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 12px 0',
              lineHeight: '1.6'
            }}>
              We retain personal information only as long as necessary to fulfill the purposes described above and comply with legal obligations. For example, if you delete your account or request deletion of your data, we will remove your information from active systems. In compliance with COPPA, any information collected from a child under 13 is kept only as long as necessary for the purpose collected and then deleted using reasonable measures. Aggregate or anonymized data may be retained indefinitely for analytical purposes, since it is no longer personally identifiable.
            </p>
          </section>

          {/* CONTACT INFORMATION */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Contact Information
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 12px 0',
              lineHeight: '1.6'
            }}>
              If you have questions, concerns, or requests regarding your personal data or this Privacy Policy, please contact us at curareofficial@gmail.com. We will respond to privacy inquiries as required by law. If you are an EU resident, you may also contact your local data protection authority with unresolved complaints.
            </p>
          </section>

          {/* UPDATES TO POLICY */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Updates to Policy
            </h2>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '0 0 12px 0',
              lineHeight: '1.6'
            }}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The "Effective Date" below indicates when the current policy took effect. When we make material changes, we will post the updated policy on the Service after any changes indicates your acceptance of those change. We encourage you to review this policy periodically.
            </p>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '40px 0 0 0',
              lineHeight: '1.6'
            }}>
              Effective Date: January 1, 2026.
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}

export default PrivacyPolicy
