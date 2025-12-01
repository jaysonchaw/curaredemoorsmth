import { useOutletContext, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Helper function to calculate streak days with timezone awareness
const calculateStreakDays = (completedLessons, timezone) => {
  if (!completedLessons || completedLessons.length === 0) return 0
  
  // Get today's date in user's timezone
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: timezone }) // YYYY-MM-DD format
  
  // Get unique dates (in user's timezone) when lessons were completed
  const completedDates = new Set()
  completedLessons.forEach(lesson => {
    if (lesson.completed_at) {
      const completedDate = new Date(lesson.completed_at)
      const dateStr = completedDate.toLocaleDateString('en-CA', { timeZone: timezone })
      completedDates.add(dateStr)
    }
  })
  
  // Sort dates in descending order
  const sortedDates = Array.from(completedDates).sort().reverse()
  
  // Calculate streak: count consecutive days from today backwards
  let streak = 0
  let currentDate = new Date(todayStr + 'T00:00:00')
  
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(sortedDates[i] + 'T00:00:00')
    const diffDays = Math.floor((currentDate - checkDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === i) {
      streak++
      // Move to previous day
      currentDate = new Date(checkDate)
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

const Home = () => {
  const { userData } = useOutletContext()
  const navigate = useNavigate()
  const [currentModule, setCurrentModule] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [stats, setStats] = useState({
    timeThisWeek: 0,
    streakDays: 0,
    badgesEarned: 0
  })
  const [activeTasks, setActiveTasks] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userData) return

      // Check for test mode
      const isTestMode = sessionStorage.getItem('is_test_mode') === 'true'
      
      try {
        let userProgressData = null
        
        if (isTestMode) {
          // Use test user data directly
          userProgressData = {
            selected_path: userData.selected_path || 'Pre-Med',
            daily_time_minutes: userData.daily_time_minutes || 30,
            xp: userData.xp || 0,
            level: userData.level || 1
          }
        } else {
          // Fetch user's current progress from database
          const { data } = await supabase
            .from('users')
            .select('selected_path, daily_time_minutes, xp, level')
            .eq('id', userData.id)
            .single()
          userProgressData = data
        }
        
        setProgressData(userProgressData)

        // Fetch lesson progress (would need a lessons_progress table)
        // For now, calculate from user's selected_path
        if (userProgressData?.selected_path) {
          // TODO: Fetch actual current module and lesson from database
          // This would require a lessons_progress or user_progress table
        }

        // Calculate stats from actual user data
        // Get user's timezone (default to UTC if not available)
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        
        // Calculate week start in user's timezone
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - 7)
        
        let timeThisWeek = 0
        let streakDays = 0
        let badgesEarned = 0
        
        if (isTestMode) {
          // Test mode: calculate from sessionStorage
          const testProgress = JSON.parse(sessionStorage.getItem('test_lesson_progress') || '[]')
          const completedLessons = testProgress.filter(p => p.status === 'completed' && p.completed_at)
          
          // Calculate time this week from completed lessons
          const weekStartTime = weekStart.getTime()
          timeThisWeek = completedLessons.reduce((sum, p) => {
            const completedTime = new Date(p.completed_at).getTime()
            if (completedTime >= weekStartTime) {
              return sum + (p.time_spent_minutes || 0)
            }
            return sum
          }, 0)
          
          // Calculate streak days (timezone-aware)
          streakDays = calculateStreakDays(completedLessons, userTimezone)
          
          badgesEarned = 0 // Test mode doesn't track badges yet
        } else {
          // Fetch completed lessons with time spent
          const { data: completedLessons } = await supabase
            .from('user_lesson_progress')
            .select('time_spent_minutes, completed_at')
            .eq('user_id', userData.id)
            .eq('status', 'completed')
            .not('completed_at', 'is', null)
          
          if (completedLessons) {
            // Calculate time this week
            const weekStartTime = weekStart.getTime()
            timeThisWeek = completedLessons.reduce((sum, lesson) => {
              if (lesson.completed_at) {
                const completedTime = new Date(lesson.completed_at).getTime()
                if (completedTime >= weekStartTime) {
                  return sum + (lesson.time_spent_minutes || 0)
                }
              }
              return sum
            }, 0)
            
            // Calculate streak days (timezone-aware)
            streakDays = calculateStreakDays(completedLessons, userTimezone)
          }
          
          // Count badges earned
          const { data: userBadges } = await supabase
            .from('user_badges')
            .select('id')
            .eq('user_id', userData.id)
          
          badgesEarned = userBadges?.length || 0
        }
        
        setStats({
          timeThisWeek,
          streakDays,
          badgesEarned
        })
        
              // Fetch current module/lesson progress
              if (isTestMode) {
                // Test mode: check sessionStorage for progress
                const testProgress = JSON.parse(sessionStorage.getItem('test_lesson_progress') || '[]')
                const inProgressLesson = testProgress.find(p => p.status === 'in_progress')
                const completedLessons = testProgress.filter(p => p.status === 'completed')
                
                if (inProgressLesson) {
                  // Get lesson details
                  const { data: lesson } = await supabase
                    .from('lessons')
                    .select('id, title, order_index')
                    .eq('id', inProgressLesson.lesson_id)
                    .single()
                  
                  if (lesson) {
                    setCurrentModule({
                      id: lesson.id,
                      title: lesson.title,
                      progress: 25, // In progress
                      nextLesson: lesson.title
                    })
                  }
                } else {
                  // Get next available lesson (first lesson or next after last completed)
                  const { data: allLessons } = await supabase
                    .from('lessons')
                    .select('id, title, order_index')
                    .eq('path_type', progressData?.selected_path || 'Pre-Med')
                    .order('order_index', { ascending: true })
                  
                  if (allLessons && allLessons.length > 0) {
                    const nextLesson = allLessons.find(l => 
                      !completedLessons.some(c => c.lesson_id === l.id)
                    ) || allLessons[0]
                    
                    setCurrentModule({
                      id: nextLesson.id,
                      title: nextLesson.title,
                      progress: 0,
                      nextLesson: nextLesson.title
                    })
                  }
                }
              } else {
                const { data: currentProgress } = await supabase
                  .from('user_lesson_progress')
                  .select(`
                    lesson_id,
                    status,
                    lessons (
                      id,
                      title,
                      path_type,
                      order_index
                    )
                  `)
                  .eq('user_id', userData.id)
                  .eq('status', 'in_progress')
                  .order('lessons(order_index)', { ascending: true })
                  .limit(1)
                  .single()
                
                if (currentProgress?.lessons) {
                  const lesson = currentProgress.lessons
                  // Calculate progress based on status: in_progress = 25%, completed = 100%
                  let progress = 0
                  if (currentProgress.status === 'completed') {
                    progress = 100
                  } else if (currentProgress.status === 'in_progress') {
                    // If in progress, estimate 25% (they've started but not completed)
                    progress = 25
                  }
                  
                  setCurrentModule({
                    id: lesson.id,
                    title: lesson.title,
                    progress: progress,
                    nextLesson: lesson.title
                  })
                } else {
                  // Get next available lesson
                  const { data: nextLesson } = await supabase
                    .from('lessons')
                    .select('id, title, order_index')
                    .eq('path_type', userProgressData?.selected_path || 'Pre-Med')
                    .order('order_index', { ascending: true })
                    .limit(1)
                    .single()
                  
                  if (nextLesson) {
                    setCurrentModule({
                      id: nextLesson.id,
                      title: nextLesson.title,
                      progress: 0,
                      nextLesson: nextLesson.title
                    })
                  }
                }
              }

        // Active tasks would come from adaptive engine
        // For now, empty array
        setActiveTasks([])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [userData])

  const handleContinue = () => {
    if (currentModule?.id) {
      navigate(`/dashboard/lesson/${currentModule.id}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentModule?.title || 'Welcome back!'}
            </h2>
            {currentModule && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Lesson Progress</span>
                  <span className="text-sm font-medium text-gray-700">{currentModule.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-curare-blue h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, currentModule.progress || 0))}%` }}
                  ></div>
                </div>
                {progressData && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">XP Progress</span>
                      <span className="text-sm font-medium text-gray-700">
                        {progressData.xp || 0} / {(progressData.level || 1) * 100} XP
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.max(0, Math.min(100, ((progressData.xp || 0) % 100))) || 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>Level {progressData.level || 1}</span>
                      <span>{100 - ((progressData.xp || 0) % 100)} XP to next level</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentModule?.nextLesson && (
              <p className="text-gray-600 mt-4">Next: {currentModule.nextLesson}</p>
            )}
          </div>
          <div className="ml-8 flex flex-col space-y-2">
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue lesson
            </button>
            <button
              onClick={() => navigate('/join-classroom')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Join Classroom
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-curare-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Time This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.timeThisWeek} min</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Streak Days</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streakDays} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.badgesEarned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Tasks</h3>
        <div className="space-y-4">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-curare-blue transition-colors cursor-pointer"
              onClick={() => navigate(`/dashboard/task/${task.id}`)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {task.type === 'quiz' ? 'Quiz' : 'Review'} • {task.estimatedTime} min
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home

