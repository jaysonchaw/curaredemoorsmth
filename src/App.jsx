import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdaptiveFeedbackArticle from './pages/AdaptiveFeedbackArticle'
import ClinicallyProvenContentArticle from './pages/ClinicallyProvenContentArticle'
import LearningEnvironmentArticle from './pages/LearningEnvironmentArticle'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
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
import Lesson from './pages/Lesson'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/for-schools" element={<ForSchools />} />
        <Route path="/admin/dashboard" element={<GroupActivationDashboard />} />
        <Route path="/teacher/signup" element={<TeacherSignup />} />
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classrooms/:id" element={<ClassroomDetail />} />
        <Route path="/adaptive-feedback" element={<AdaptiveFeedbackArticle />} />
        <Route path="/clinically-proven-content" element={<ClinicallyProvenContentArticle />} />
        <Route path="/learning-environment" element={<LearningEnvironmentArticle />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/introduction" element={<Introduction />} />
        <Route path="/join-classroom" element={<JoinClassroom />} />
        <Route path="/testsecurev2" element={<TestSecureV2 />} />
        <Route path="/testsecurev2/lesson/:lessonId" element={<Lesson />} />
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

