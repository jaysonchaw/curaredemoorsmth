import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SplitText from '../components/reactbits/SplitText'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import Footer from '../components/Footer'
import PilotSignupModal from '../components/school/PilotSignupModal'

const ForSchools = () => {
  const navigate = useNavigate()
  const [showPilotModal, setShowPilotModal] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Load Calendly widget script and CSS (only once)
  useEffect(() => {
    // Check if already loaded
    const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
    const existingLink = document.querySelector('link[href="https://assets.calendly.com/assets/external/widget.css"]')

    // Load Calendly CSS if not already loaded
    if (!existingLink) {
      const link = document.createElement('link')
      link.href = 'https://assets.calendly.com/assets/external/widget.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // Load Calendly widget script if not already loaded
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }

  }, [])

  // Re-initialize Calendly widget when modal opens
  useEffect(() => {
    if (showDemoModal) {
      // Wait for Calendly to load, then initialize
      const initCalendly = () => {
        if (window.Calendly) {
          const widget = document.querySelector('.calendly-inline-widget')
          if (widget) {
            // Calendly will auto-initialize from data-url attribute, but we can also manually init
            try {
              window.Calendly.initInlineWidget({
                url: 'https://calendly.com/qoobja/30min',
                parentElement: widget,
              })
            } catch (e) {
              // Widget may already be initialized, which is fine
              console.log('Calendly widget initialization:', e.message)
            }
          }
        } else {
          // Retry after a short delay if Calendly not loaded yet
          setTimeout(initCalendly, 200)
        }
      }
      
      // Small delay to ensure DOM is ready
      setTimeout(initCalendly, 100)
    }
  }, [showDemoModal])

  const benefits = [
    {
      title: 'Replace Science Class',
      description: 'Use Curare as your official science curriculum with comprehensive coverage of biology and medicine.',
    },
    {
      title: 'Turnkey Teacher Guides',
      description: 'Ready-to-use lesson scripts, printable handouts, and assessment sheets for every module.',
    },
    {
      title: 'Assessments & Certificates',
      description: 'Built-in quizzes, pre/post assessments, and printable certificates for student achievements.',
    },
    {
      title: 'Clinician Oversight',
      description: 'All content reviewed and approved by medical professionals, clinicians, and professors.',
    },
    {
      title: 'Measurable Learning Gains',
      description: 'Track activation rates, retention, and pre/post learning gains with exportable reports.',
    },
    {
      title: 'Parent Reporting',
      description: 'One-page progress summaries and certificates parents can include in portfolios.',
    },
  ]

  const pilotOptions = [
    {
      type: 'Free 4-Week Pilot',
      includes: [
        'Up to 30 student seats',
        'Teacher onboarding and training',
        'Module 0 orientation assignment',
        'Basic progress reporting',
        'Email support',
      ],
    },
    {
      type: 'Paid Pilot',
      includes: [
        'Up to 100 student seats',
        'Full teacher training and support',
        'Custom module assignments',
        'Detailed analytics dashboard',
        'Dedicated support channel',
      ],
    },
    {
      type: 'Sponsored Pilot',
      includes: [
        'Unlimited seats',
        'Full implementation support',
        'Custom curriculum mapping',
        'Advanced reporting and analytics',
        'Priority support and consultation',
      ],
      unavailable: true,
      unavailableMessage: 'Currently unavailable - Coming soon',
    },
  ]

  const partnershipSteps = [
    {
      step: 1,
      title: 'Request Pilot',
      description: 'Fill out a quick form with your school details and pilot preferences.',
    },
    {
      step: 2,
      title: 'School Onboarding',
      description: 'Receive your school access key, set up teacher accounts, and complete consent forms.',
    },
    {
      step: 3,
      title: 'Pilot Runs',
      description: 'Teachers assign modules, students complete lessons, and progress is tracked automatically.',
    },
    {
      step: 4,
      title: 'Results & Decision',
      description: 'Review pilot metrics, learning gains, and teacher feedback to decide on full implementation.',
    },
    {
      step: 5,
      title: 'Implementation Pilot Agreement',
      description: 'Sign Pilot Agreement and begin full rollout with ongoing support and curriculum updates.',
    },
  ]

  const faqs = [
    {
      question: 'Is student data safe and private?',
      answer: 'Yes. We collect minimal PII, require parent consent for minors, encrypt data at rest, and comply with student privacy regulations. Teachers can anonymize reports for external sharing.',
    },
    {
      question: 'How much time does this add to teacher workload?',
      answer: 'Curare is designed to reduce workload. Ready-to-use lesson scripts, auto-graded assessments, and built-in progress tracking save teachers hours per week compared to creating materials from scratch.',
    },
    {
      question: 'What about parent consent?',
      answer: 'We provide consent templates and clear guidance. Teachers can bulk send consent emails and track pending consents in their dashboard. Students cannot activate accounts without consent.',
    },
    {
      question: 'How do you measure learning gains?',
      answer: 'We track pre/post quiz scores, time spent, completion rates, and engagement metrics. Teachers receive detailed reports showing individual and class-wide improvements.',
    },
    {
      question: 'Can we customize the curriculum?',
      answer: 'Yes. Teachers can lock/unlock lessons, create custom assignments, and map lessons to their classroom sequence. Full implementation includes custom curriculum mapping.',
    },
    {
      question: 'What support is available?',
      answer: 'Pilots include email support and teacher training. Full implementation includes dedicated support channels, regular check-ins, and consultation on curriculum integration.',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button and Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-curare-blue transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <Link to="/" className="flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Curare" 
                  style={{ height: '40px' }}
                  className="w-auto"
                />
              </Link>
            </div>

            {/* Teacher Login Link */}
            <div className="flex-shrink-0">
              <Link
                to="/teacher/login"
                className="text-curare-blue hover:text-blue-700 font-medium"
              >
                Teacher Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed nav */}
      <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-curare-blue to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <SplitText
            text="Implement Curare as your official science curriculum. Clinically reviewed. Teacher ready."
            className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6"
            delay={50}
            duration={0.8}
          />
          <p className="text-xl mb-8 text-blue-100">
            Do you want to run a pilot or discuss full implementation? Book a meeting or request a pilot in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowPilotModal(true)}
              className="px-8 py-4 bg-white text-curare-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Pilot
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors border-2 border-white"
            >
              Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Schools Choose Curare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedContent key={index} direction="vertical">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Options */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pilot Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pilotOptions.map((option, index) => (
              <AnimatedContent key={index} direction="vertical">
                <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${option.unavailable ? 'border-gray-300 opacity-75' : 'border-gray-200'} relative`}>
                  {option.unavailable && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        Unavailable
                      </span>
                    </div>
                  )}
                  <h3 className={`text-xl font-semibold mb-4 ${option.unavailable ? 'text-gray-500' : 'text-curare-blue'}`}>
                    {option.type}
                  </h3>
                  {option.unavailable && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">
                        {option.unavailableMessage || 'Currently unavailable - Coming soon'}
                      </p>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {option.includes.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className={option.unavailable ? 'text-gray-500' : 'text-gray-700'}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* School Packages */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            School Packages
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic School License</h3>
              <p className="text-gray-600 mb-4">
                Full access to all lessons, teacher dashboard, and basic reporting. Perfect for single classrooms or small schools.
              </p>
              <p className="text-sm text-gray-500">Contact us for pricing</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pilot to Implementation</h3>
              <p className="text-gray-600 mb-4">
                Start with a pilot, then transition to full implementation with custom curriculum mapping and dedicated support.
              </p>
              <p className="text-sm text-gray-500">Contact us for pricing</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">District Rollout</h3>
              <p className="text-gray-600 mb-4">
                Multi-school implementation with district-wide analytics, custom training programs, and priority support.
              </p>
              <p className="text-sm text-gray-500">Contact us for pricing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Partnership Steps
          </h2>
          <div className="space-y-8">
            {partnershipSteps.map((step, index) => (
              <AnimatedContent key={index} direction="horizontal">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-curare-blue text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Resources</h2>
          <div className="space-y-4">
            <a
              href="/school-partnership-info-pack.pdf"
              download="school-partnership-info-pack.pdf"
              className="block px-6 py-4 bg-curare-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Download School Partnership Info Pack
            </a>
            <a
              href="/sample-pilot-agreement.pdf"
              download="sample-pilot-agreement.pdf"
              className="block px-6 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Download Sample Pilot Agreement
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <AnimatedContent key={index} direction="vertical">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-curare-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Request a pilot today and see how Curare can transform your science curriculum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowPilotModal(true)}
              className="px-8 py-4 bg-white text-curare-blue rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Request Pilot
            </button>
            <button
              onClick={() => setShowDemoModal(true)}
              className="px-8 py-4 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors border-2 border-white"
            >
              Book Demo
            </button>
          </div>
        </div>
      </section>

      </div> {/* End padding div */}
      <Footer />

      {/* Modals */}
      {showPilotModal && (
        <PilotSignupModal
          isOpen={showPilotModal}
          onClose={() => setShowPilotModal(false)}
          onSuccess={() => {
            setShowPilotModal(false)
            // Show success message or redirect
          }}
        />
      )}

      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-gray-900">Book a Demo</h3>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Schedule a call with our team to discuss how Curare can work for your school.
              </p>
              {/* Calendly inline widget */}
              {/* 
                NOTE: Replace the data-url below with your actual Calendly event URL.
                To get your Calendly URL:
                1. Create a Calendly account at https://calendly.com
                2. Create an event type (e.g., "30-minute demo call")
                3. Copy the event URL and paste it here
                Example: https://calendly.com/your-username/30min
              */}
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/qoobja/30min"
                style={{ minWidth: '320px', height: '700px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForSchools

