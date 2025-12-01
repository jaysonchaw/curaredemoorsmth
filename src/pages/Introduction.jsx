import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import SplitText from '../components/reactbits/SplitText'
import Counter from '../components/Counter'
import GlareHover from '../components/reactbits/GlareHover'
import ButtonTemplate from '../components/ButtonTemplate'

const Introduction = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [timeMinutes, setTimeMinutes] = useState(1)
  const [selectedPath, setSelectedPath] = useState(null)
  const [userAge, setUserAge] = useState(null)
  const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('birthday')
          .eq('id', session.user.id)
          .single()
        
        if (data?.birthday) {
          const birthDate = new Date(data.birthday)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          const monthDiff = today.getMonth() - birthDate.getMonth()
          const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
          setUserAge(calculatedAge)
        }
      }
    }
    fetchUserData()
  }, [])

  const suggestedPath = userAge && userAge >= 7 && userAge <= 12 ? 'Pre-Med' : 'Med'

  const handleTimeSet = () => {
    setTimeout(() => {
      setStep(4)
    }, 800)
  }

  const handlePathSelect = (path) => {
    setSelectedPath(path)
    setTimeout(() => {
      setStep(5)
    }, 800)
  }

  const handleComplete = async () => {
    if (isTestMode) {
      // For test mode, just update sessionStorage
      const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
      testUserData.has_completed_intro = true
      testUserData.daily_time_minutes = timeMinutes
      testUserData.selected_path = selectedPath || 'Pre-Med'
      sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
      navigate('/dashboard')
      return
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase
        .from('users')
        .update({
          has_completed_intro: true,
          daily_time_minutes: timeMinutes,
          selected_path: selectedPath
        })
        .eq('id', session.user.id)
    }
    navigate('/dashboard')
  }

  const handleSkipIntro = () => {
    if (isTestMode) {
      const testUserData = JSON.parse(sessionStorage.getItem('test_user_data') || '{}')
      testUserData.has_completed_intro = true
      testUserData.daily_time_minutes = 30
      testUserData.selected_path = 'Pre-Med'
      sessionStorage.setItem('test_user_data', JSON.stringify(testUserData))
      navigate('/dashboard')
    }
  }

  // Auto-advance steps
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 800)
      return () => clearTimeout(timer)
    }
    if (step === 1) {
      // Welcome to Curare - animation duration is 1.8s, plus character delays
      // "Welcome to Curare" = 18 chars, delay 100ms each = 1.8s delay + 1.8s duration = ~3.6s
      // Add additional 1.2s wait = 4.8s total
      const timer = setTimeout(() => setStep(2), 4800)
      return () => clearTimeout(timer)
    }
    if (step === 2) {
      // Wait for "You're about to start..." animation to complete
      // Text is long: "You're about to start an amazing journey into the world of medicine."
      // That's about 60 characters, delay 50ms each = 3s delay + 0.4s duration = ~3.4s
      // Add extra wait time for readability
      const timer = setTimeout(() => setStep(2.5), 5000) // Wait 5 seconds total for text to finish and be readable
      return () => clearTimeout(timer)
    }
    if (step === 2.5) {
      // Wait 3 seconds after "Ready?" appears before showing counter
      const timer = setTimeout(() => setStep(3), 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="min-h-screen bg-white overflow-hidden" style={{ pointerEvents: step === 0 || step === 1 || step === 2 || step === 2.5 ? 'none' : 'auto' }}>
      {/* Developer Skip Button */}
      {isTestMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleSkipIntro}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors shadow-lg"
          >
            🔧 Skip Intro (Dev)
          </button>
        </div>
      )}
      
      {step === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          {/* Blank space for 0.8 seconds */}
        </div>
      )}

      {step === 1 && (
        <div className="min-h-screen flex items-center justify-center">
          <SplitText
            text="Welcome to Curare"
            className="text-5xl font-semibold text-black"
            delay={100}
            duration={1.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40, scale: 0.85 }}
            to={{ opacity: 1, y: 0, scale: 1 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </div>
      )}

      {step === 2 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-3xl font-semibold text-black text-center max-w-3xl mb-8" style={{ wordBreak: 'keep-all', hyphens: 'none', lineHeight: '1.5' }}>
            <SplitText
              text="You're about to start an amazing journey into the world of medicine."
              className=""
              delay={50}
              duration={0.4}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
        </div>
      )}

      {step === 2.5 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="mb-8">
            <SplitText
              text="You're about to start an amazing journey into the world of medicine."
              className="text-3xl font-semibold text-black text-center max-w-3xl mb-8"
              delay={0}
              duration={0}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 1, y: 0 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
          <div className="mt-8">
            <SplitText
              text="Ready?"
              className="text-4xl font-semibold text-black"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-3xl font-semibold text-black text-center max-w-3xl mb-12" style={{ wordBreak: 'keep-all', hyphens: 'none', lineHeight: '1.5' }}>
            <SplitText
              text={`First, how much time out of your day are you willing to spend taking these lessons?`}
              className=""
              delay={50}
              duration={0.4}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
          <div className="mb-8 flex items-center gap-4">
            <Counter 
              value={timeMinutes} 
              places={[100, 10, 1]} 
              fontSize={80} 
              padding={5} 
              gap={10} 
              textColor="#000000" 
              fontWeight={900}
              gradientFrom="#ffffff"
              gradientTo="transparent"
            />
            <span style={{ fontSize: '48px', color: '#000000', fontWeight: 900 }}>
              min
            </span>
          </div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setTimeMinutes(Math.max(1, timeMinutes - 1))}
              className="px-6 py-3 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              -
            </button>
            <button
              onClick={() => setTimeMinutes(Math.min(120, timeMinutes + 1))}
              className="px-6 py-3 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              +
            </button>
          </div>
          <ButtonTemplate
            variant="button1"
            text="Set Time"
            textColor="white"
            onClick={handleTimeSet}
            className="w-auto"
            style={{ width: '150px', height: 'auto' }}
          />
        </div>
      )}

      {step === 4 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <SplitText
            text={`Great! Now choose where you'd like to start. Personally, I recommend ${suggestedPath}`}
            className="text-3xl font-semibold text-black text-center max-w-3xl mb-12"
            delay={50}
            duration={0.4}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <button
              onClick={() => handlePathSelect('Pre-Med')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedPath === 'Pre-Med'
                  ? 'border-curare-blue bg-blue-50'
                  : 'border-gray-300 hover:border-curare-blue'
              }`}
            >
              <h3 className="text-2xl font-semibold text-black mb-2">Pre-Med</h3>
              <p className="text-gray-600">Learn the fundamentals of human biology and get a sense of what we're dealing with.</p>
              <p className="text-gray-500 mt-2">Length: 30 Lessons</p>
            </button>
            <button
              onClick={() => handlePathSelect('Med')}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedPath === 'Med'
                  ? 'border-curare-blue bg-blue-50'
                  : 'border-gray-300 hover:border-curare-blue'
              }`}
            >
              <h3 className="text-2xl font-semibold text-black mb-2">Med</h3>
              <p className="text-gray-600">Now we're talking. Delve into basic medical knowledge and procedures.</p>
              <p className="text-gray-500 mt-2">Length: 18 Lessons</p>
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <SplitText
            text="You're all set!"
            className="text-4xl font-semibold text-black mb-8"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <div className="max-w-2xl text-center space-y-4 mb-12">
            <p className="text-xl text-gray-700">
              - Read lessons on topics like the human body, cells, and health.
            </p>
            <p className="text-xl text-gray-700">
              - Answer quizzes to test what you've learnt thus far.
            </p>
            <p className="text-xl text-gray-700">
              - Earn XP & badges as you complete lessons and level up.
            </p>
          </div>
          <GlareHover
            glareColor="#ffffff"
            glareOpacity={0.3}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            playOnce={false}
          >
            <ButtonTemplate
              variant="button1"
              text="I'm Ready!"
              textColor="white"
              onClick={handleComplete}
              className="w-auto"
              style={{ width: '200px', height: 'auto' }}
            />
          </GlareHover>
        </div>
      )}

    </div>
  )
}

export default Introduction

