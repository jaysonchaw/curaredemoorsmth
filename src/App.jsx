import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { initializeCookieConsent, initializeEssentialCookies } from './utils/cookieManager'
import { trackRetention, startSessionTracking } from './utils/analyticsTracker'
import HomePage from './pages/HomePage'
import AdaptiveFeedbackArticle from './pages/AdaptiveFeedbackArticle'
import ClinicallyProvenContentArticle from './pages/ClinicallyProvenContentArticle'
import LearningEnvironmentArticle from './pages/LearningEnvironmentArticle'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AboutUs from './pages/AboutUs'
import Pricing from './pages/Pricing'
import SignupPage from './pages/SignupPage'
import AuthCallback from './pages/AuthCallback'
import Introduction from './pages/Introduction'
import Dashboard from './pages/Dashboard'
import Home from './pages/dashboard/Home'
import Roadmap from './pages/dashboard/Roadmap'
import LessonPlayer from './pages/dashboard/LessonPlayer'
import Results from './pages/dashboard/Results'
import Profile from './pages/dashboard/Profile'
import AdminPanel from './pages/dashboard/AdminPanel'
import AdminDashboard from './pages/AdminDashboard'
import PostTest from './pages/dashboard/PostTest'
import StudentClassroom from './pages/dashboard/StudentClassroom'
import ScrollToTop from './components/ScrollToTop'
import TeacherSignup from './pages/teacher/TeacherSignup'
import TeacherLogin from './pages/teacher/TeacherLogin'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ClassroomDetail from './pages/teacher/ClassroomDetail'
import JoinClassroom from './pages/JoinClassroom'
import ForSchools from './pages/ForSchools'
import GroupActivationDashboard from './pages/admin/GroupActivationDashboard'
import TestSecureV2 from './pages/TestSecureV2'
import UnitContent from './pages/UnitContent'
import Lesson from './pages/Lesson'
import PersonalizedPractice from './pages/PersonalizedPractice'
import LessonPractice from './pages/LessonPractice'
import Review from './pages/Review'
import SkipQuiz from './pages/SkipQuiz'
import Quests from './pages/Quests'
import More from './pages/More'
import Settings from './pages/Settings'
import AuthPage from './pages/AuthPage'
import VerifyCode from './pages/VerifyCode'
import VerifyEmail from './pages/VerifyEmail'
import BlockResetDevice from './pages/BlockResetDevice'
import ResetPassword from './pages/ResetPassword'
import Welcome from './pages/Welcome'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRedirect from './components/AuthRedirect'

function App() {
  // Initialize cookie consent and analytics on app load
  useEffect(() => {
    const initCookies = async () => {
      // Initialize essential cookies first (CSRF token, session token migration)
      initializeEssentialCookies()
      // Then initialize cookie consent
      await initializeCookieConsent()
      // Start session tracking
      startSessionTracking()
      // Track retention (daily visit)
      trackRetention()
    }
    initCookies()
  }, [])

  // Update body/html background based on light mode
  useEffect(() => {
    const updateBackground = () => {
      const isLightMode = localStorage.getItem('tsv2LightMode') === 'true'
      const bgColor = isLightMode ? '#ffffff' : '#161d25ff'
      document.body.style.backgroundColor = bgColor
      document.documentElement.style.backgroundColor = bgColor
    }

    // Update on mount
    updateBackground()

    // Listen for storage changes (when light mode is toggled in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'tsv2LightMode') {
        updateBackground()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also listen for custom event (for same-tab updates)
    const handleLightModeChange = () => {
      updateBackground()
    }

    window.addEventListener('lightModeChanged', handleLightModeChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('lightModeChanged', handleLightModeChange)
    }
  }, [])
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Auth page - always accessible */}
        <Route 
          path="/auth" 
          element={<AuthPage />}
        />
        {/* Homepage - always accessible */}
        <Route 
          path="/" 
          element={<HomePage />}
        />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<GroupActivationDashboard />} />
        <Route path="/teacher/signup" element={<TeacherSignup />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classrooms/:id" element={<ClassroomDetail />} />
        <Route path="/adaptive-feedback" element={<AdaptiveFeedbackArticle />} />
        <Route path="/clinically-proven-content" element={<ClinicallyProvenContentArticle />} />
        <Route path="/learning-environment" element={<LearningEnvironmentArticle />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/block-reset-device" element={<BlockResetDevice />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/join-classroom" element={<JoinClassroom />} />
        <Route path="/testsecurev2" element={
          <ProtectedRoute>
            <TestSecureV2 />
          </ProtectedRoute>
        } />
        <Route path="/testsecurev2/lesson/:lessonId" element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        } />
        <Route path="/testsecurev2/lesson/:lessonId/part2" element={
          <ProtectedRoute>
            <LessonPlayer />
          </ProtectedRoute>
        } />
        <Route path="/testsecurev2/lesson/:lessonId/practice" element={
          <ProtectedRoute>
            <LessonPractice />
          </ProtectedRoute>
        } />
        <Route path="/testsecurev2/practice/:practiceIndex" element={
          <ProtectedRoute>
            <PersonalizedPractice />
          </ProtectedRoute>
        } />
        <Route path="/testsecurev2/unit/:unitId" element={
          <ProtectedRoute>
            <UnitContent />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:lessonId" element={
          <ProtectedRoute>
            <Lesson />
          </ProtectedRoute>
        } />
        <Route path="/lesson/:lessonId/practice" element={
          <ProtectedRoute>
            <LessonPractice />
          </ProtectedRoute>
        } />
        <Route path="/practice/:practiceIndex" element={
          <ProtectedRoute>
            <PersonalizedPractice />
          </ProtectedRoute>
        } />
        <Route path="/unit/:unitId" element={
          <ProtectedRoute>
            <UnitContent />
          </ProtectedRoute>
        } />
        <Route path="/review/:unitId" element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        } />
        <Route path="/skip-quiz/:unitId" element={
          <ProtectedRoute>
            <Pricing />
          </ProtectedRoute>
        } />
        <Route path="/quests" element={
          <ProtectedRoute>
            <Quests />
          </ProtectedRoute>
        } />
        <Route path="/more" element={
          <ProtectedRoute>
            <More />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="lesson/:lessonId" element={<LessonPlayer />} />
          <Route path="results" element={<Results />} />
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="post-test" element={<PostTest />} />
          <Route path="classroom/:classroomId" element={<StudentClassroom />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
