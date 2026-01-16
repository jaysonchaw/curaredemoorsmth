import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SidebarNavigation from '../components/SidebarNavigation'
import { getInitialLightMode } from '../utils/lightModeInit'
import { signOut } from '../services/supabaseService'
import { removeSessionToken } from '../utils/cookieManager'
import {
  getCompletedLessons,
  getCompletedItems,
  getProgress,
  setProgress,
  getDailyXP,
  addDailyXP,
  getDailyLessonCount,
  setDailyLessonCount,
  markLessonCompletedOnDate,
  PROGRESS_KEYS
} from '../services/progressService'
import { supabase } from '../services/supabaseService'

const TestSecureV2 = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const rowRefs = useRef([])
  
  const unitHeaderRefs = useRef([])
  const unitContainerRefs = useRef([])
  const [pressedIndex, setPressedIndex] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showSheetFor, setShowSheetFor] = useState(null)
  const [sheetAnchorScroll, setSheetAnchorScroll] = useState(0)
  const [isSheetHidden, setIsSheetHidden] = useState(true)
  const [completedLessons, setCompletedLessons] = useState([])
  const [isStartPressed, setIsStartPressed] = useState(false)
  const [isPracticePressed, setIsPracticePressed] = useState(false)
  const [activeUnitIndex, setActiveUnitIndex] = useState(0)
  const [dailyQuests, setDailyQuests] = useState([])
  const [dailyXP, setDailyXP] = useState(0)
  const [isStickyPinned, setIsStickyPinned] = useState(false)
  const unitDividerRefs = useRef([])
  const stickyHeaderOriginalTop = useRef(null)
  const roadmapContainerRef = useRef(null)
  const [roadmapHeight, setRoadmapHeight] = useState(0)
  const [dailyLessonCount, setDailyLessonCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)
  const [hasCompletedToday, setHasCompletedToday] = useState(false)
  const [weeklyProgress, setWeeklyProgress] = useState({})
  const [userTimezone, setUserTimezone] = useState(null)
  const [userStartDay, setUserStartDay] = useState(null)
  // Initialize light mode from localStorage synchronously to prevent flash
  const [isLightMode, setIsLightMode] = useState(getInitialLightMode)

  const getXOffset = (index) => {
    const pattern = [0, 40, 80, 40]
    const cycleIndex = Math.floor(index / 4)
    const positionInCycle = index % 4
    const baseOffset = pattern[positionInCycle]
    return cycleIndex % 2 === 0 ? baseOffset : -baseOffset
  }

  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayOfWeek = () => {
    const now = new Date()
    return now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  }

  // Get day letter (M, T, W, T, F)
  const getDayLetter = (dayIndex) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    return days[dayIndex]
  }

  // Initialize timezone on mount
  useEffect(() => {
    const initialize = async () => {
      const storedTimezone = await getProgress(PROGRESS_KEYS.userTimezone)
      const storedStartDay = await getProgress(PROGRESS_KEYS.userStartDay)
      
      if (!storedTimezone || !storedStartDay) {
        // New user or reset - store current timezone and day
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const startDay = getCurrentDayOfWeek()
        await setProgress(PROGRESS_KEYS.userTimezone, timezone)
        await setProgress(PROGRESS_KEYS.userStartDay, String(startDay))
        setUserTimezone(timezone)
        setUserStartDay(startDay)
      } else {
        setUserTimezone(storedTimezone)
        setUserStartDay(parseInt(storedStartDay, 10))
      }
    }
    
    initialize()
  }, [])

  // Track completed lessons

  const loadUserProgress = async () => {
    try {
      // Debug: Check what keys exist in localStorage
      const allKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('tsv2Completed') || key.includes('user_') || key.includes('guest_'))) {
          allKeys.push(key)
        }
      }
      
      const completed = await getCompletedLessons()
      setCompletedLessons(completed)
      
      const items = await getCompletedItems()
      setCompletedItems(Array.isArray(items) ? items : [])
    } catch (e) {
      console.error('[TestSecureV2] Error loading user progress:', e)
      setCompletedLessons([])
      setCompletedItems([])
    }
  }

  useEffect(() => {
    const initialize = async () => {
      await loadUserProgress()
    }
    
    initialize()
    
    const handleProgressUpdate = () => {
      loadUserProgress()
    }
    window.addEventListener('progressUpdated', handleProgressUpdate)
    
    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate)
    }
  }, [])

  const [completedItems, setCompletedItems] = useState([])
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render trigger

  // Quest system: Generate random daily tasks based on weighted percentages
  const generateDailyQuests = async () => {
    const today = new Date().toDateString()
    const storedQuests = await getProgress(PROGRESS_KEYS.dailyQuests(today))
    const storedDate = await getProgress(PROGRESS_KEYS.dailyQuestsDate)
    
    // If we already have quests for today, return them (with normalized progress)
    if (storedQuests && storedDate === today) {
      const parsedQuests = JSON.parse(storedQuests)
      // Normalize progress - ensure it's always a number, not a date string
      return parsedQuests.map(quest => {
        let progress = 0
        if (typeof quest.progress === 'string' && quest.progress.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // If progress is a date string, reset it to 0
          progress = 0
        } else if (typeof quest.progress === 'number') {
          progress = quest.progress
        } else if (typeof quest.progress === 'string') {
          // Try to parse as number
          const parsed = parseInt(quest.progress, 10)
          progress = isNaN(parsed) ? 0 : parsed
        }
        return { ...quest, progress }
      })
    }
    
    // Generate new quests for today
    const questTypes = [
      { type: 'complete_review', weight: 10, label: 'Complete a Review' },
      { type: 'complete_unit', weight: 10, label: 'Complete a Unit' },
      { type: 'do_2_lessons', weight: 20, label: 'Do 2 Lessons' },
      { type: 'do_1_lesson', weight: 40, label: 'Do 1 Lesson' },
      { type: 'get_20xp', weight: 5, label: 'Get 20XP' },
      { type: 'get_10xp', weight: 15, label: 'Get 10XP' }
    ]
    
    // Create weighted array
    const weightedArray = []
    questTypes.forEach(quest => {
      for (let i = 0; i < quest.weight; i++) {
        weightedArray.push(quest)
      }
    })
    
    // Shuffle array
    for (let i = weightedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weightedArray[i], weightedArray[j]] = [weightedArray[j], weightedArray[i]]
    }
    
    // Select two random quests (without replacement)
    const selectedQuests = []
    const availableQuests = [...weightedArray]
    
    for (let i = 0; i < 2; i++) {
      if (availableQuests.length === 0) break
      const randomIndex = Math.floor(Math.random() * availableQuests.length)
      const selectedQuest = availableQuests[randomIndex]
      selectedQuests.push(selectedQuest)
      // Remove selected quest to avoid duplicates
      availableQuests.splice(randomIndex, 1)
    }
    
    const newQuests = selectedQuests.map((selectedQuest, index) => ({
      id: `quest_${Date.now()}_${index}`,
      type: selectedQuest.type,
      label: selectedQuest.label,
      progress: 0,
      target: selectedQuest.type === 'do_2_lessons' ? 2 : 
              selectedQuest.type === 'do_1_lesson' ? 1 :
              selectedQuest.type === 'get_20xp' ? 20 :
              selectedQuest.type === 'get_10xp' ? 10 : 1,
      completed: false
    }))
    
    // Store quests for today
    await setProgress(PROGRESS_KEYS.dailyQuests(today), JSON.stringify(newQuests))
    await setProgress(PROGRESS_KEYS.dailyQuestsDate, today)
    
    return newQuests
  }

  // Load daily quests
  useEffect(() => {
    const initialize = async () => {
      const quests = await generateDailyQuests()
      // Set quests first, then check progress (which will filter completed ones)
      setDailyQuests(quests)
      
      // Load daily XP
      const today = new Date().toDateString()
      const storedDailyXP = await getDailyXP(today)
      setDailyXP(storedDailyXP)
    }
    
    initialize()
  }, [])
  
  // After quests are loaded, check their progress
  useEffect(() => {
    if (dailyQuests.length > 0) {
      checkQuestProgress()
    }
  }, [completedLessons, completedItems, dailyXP, dailyLessonCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompletedItems = async () => {
    try {
      const items = await getCompletedItems()
      setCompletedItems(items)
    } catch (e) {
      // Silent fail
    }
  }

  useEffect(() => {
    loadCompletedItems()
    
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes('tsv2CompletedItems')) {
        loadCompletedItems()
      }
      if (e.key && e.key.includes('tsv2Completed') && !e.key.includes('Items')) {
        loadUserProgress()
      }
    }
    
    // Listen for custom events for same-tab updates
    const handleCustomStorageUpdate = () => {
      loadCompletedItems()
    }
    
    const handleLessonCompleted = async () => {
      await loadUserProgress()
      await loadCompletedItems()
      await updateDailyLessonCount() // This will recalculate streak
      const weekly = await calculateWeeklyProgress()
      setWeeklyProgress(weekly)
      // Trigger quest progress update
      await checkQuestProgress()
      setForceUpdate(prev => prev + 1)
    }
    
    // Listen for XP updates
    const handleXPUpdate = async (e) => {
      const today = new Date().toDateString()
      const xpGained = e.detail?.xp || 0
      const newDailyXP = await addDailyXP(today, xpGained)
      setDailyXP(newDailyXP)
      // Trigger quest progress update when XP changes
      await checkQuestProgress()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('tsv2StorageUpdate', handleCustomStorageUpdate)
    window.addEventListener('tsv2LessonCompleted', handleLessonCompleted)
    window.addEventListener('tsv2XPGained', handleXPUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('tsv2StorageUpdate', handleCustomStorageUpdate)
      window.removeEventListener('tsv2LessonCompleted', handleLessonCompleted)
      window.removeEventListener('tsv2XPGained', handleXPUpdate)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  const handleLogout = async () => {
    try {
      await signOut()
      removeSessionToken()
      localStorage.removeItem('user')
      // Clear age and onboarding responses
      localStorage.removeItem('curare_user_age')
      sessionStorage.removeItem('welcomeResponses')
      navigate('/')
    } catch (error) {
      removeSessionToken()
      localStorage.removeItem('user')
      // Clear age and onboarding responses
      localStorage.removeItem('curare_user_age')
      sessionStorage.removeItem('welcomeResponses')
      navigate('/')
    }
  }

  // Toggle light mode and save to localStorage
  const toggleLightMode = async () => {
    const newValue = !isLightMode
    const bgColor = newValue ? '#ffffff' : '#161d25ff'
    
    // Update body/html background immediately for smooth transition
    document.body.style.backgroundColor = bgColor
    document.documentElement.style.backgroundColor = bgColor
    
    // Update state and localStorage
    setIsLightMode(newValue)
    await setProgress(PROGRESS_KEYS.lightMode, String(newValue))
    
    // Dispatch custom event for other listeners
    window.dispatchEvent(new Event('lightModeChanged'))
  }



  // Get current day key (timezone-aware, midnight to midnight)
  const getCurrentDayKey = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get day key for a specific date
  const getDayKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Calculate streak: counts consecutive days with at least one meaningful action
  // Meaningful actions: completing a lesson, review, or skip quiz
  // Streak increments by 1 per day (not per action)
  // If a day has no meaningful action, streak resets to 0
  const calculateStreak = async () => {
    let streak = 0
    const today = new Date()
    let currentDate = new Date(today)
    
    // Start from today and work backwards, counting CONSECUTIVE days
    // Stop as soon as we hit a day with no meaningful actions
    
    const maxDaysToCheck = 365 // Safety limit
    
    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateKey = getDayKey(currentDate)
      let hasAction = await getDailyLessonCount(dateKey) > 0
      
      // If no value exists, check if there's a meaningful action for this day
      // This handles the case where updateDailyLessonCount hasn't run yet
      if (!hasAction) {
        // Check if there are any lessons completed on this day
        const completed = await getCompletedLessons()
        for (const lessonIndex of completed) {
          const completionDay = await getProgress(PROGRESS_KEYS.lessonCompletion(lessonIndex))
          if (completionDay === dateKey) {
            hasAction = true
            break
          }
        }
        
        // Also check for reviews and skip quizzes
        if (!hasAction) {
          const items = await getCompletedItems()
          for (const item of items) {
            if (typeof item === 'string' && (item.startsWith('review_') || item.startsWith('skipquiz_'))) {
              const itemCompletionDay = await getProgress(PROGRESS_KEYS.itemCompletion(item))
              if (itemCompletionDay === dateKey) {
                hasAction = true
                break
              }
            }
          }
        }
      }
      
      // Normalize and store
      if (hasAction) {
        await setDailyLessonCount(dateKey, 1)
        streak++
        // Go back one day
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        // Hit a day with no meaningful actions - streak breaks here
        break
      }
    }
    
    return streak
  }

  // Calculate weekly progress (Monday to Friday)
  const calculateWeeklyProgress = async () => {
    const progress = {}
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Get Monday of current week
    const monday = new Date(today)
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    monday.setDate(today.getDate() - daysToMonday)
    
    // Check each day from Monday to Friday
    for (let i = 0; i < 5; i++) {
      const checkDate = new Date(monday)
      checkDate.setDate(monday.getDate() + i)
      const dateKey = getDayKey(checkDate)
      const count = await getDailyLessonCount(dateKey)
      progress[dateKey] = count > 0
    }
    
    return progress
  }

  // Check if a meaningful action happened today
  // Meaningful actions: lessons, reviews, skip quizzes
  const hasMeaningfulActionToday = async () => {
    const dayKey = getCurrentDayKey()
    
    // Check lessons completed today
    const completed = await getCompletedLessons()
    for (const lessonIndex of completed) {
      const completionDay = await getProgress(PROGRESS_KEYS.lessonCompletion(lessonIndex))
      if (completionDay === dayKey) {
        return true
      }
    }
    
    // Check reviews and skip quizzes completed today
    const items = await getCompletedItems()
    for (const item of items) {
      if (typeof item === 'string') {
        let completionDay = null
        if (item.startsWith('review_')) {
          completionDay = await getProgress(PROGRESS_KEYS.reviewCompletion(item))
        } else if (item.startsWith('skipQuiz_')) {
          completionDay = await getProgress(PROGRESS_KEYS.skipQuizCompletion(item))
        }
        if (completionDay === dayKey) {
          return true
        }
      }
    }
    
    return false
  }

  // Update daily lesson count and streak
  const updateDailyLessonCount = async () => {
    const dayKey = getCurrentDayKey()
    
    try {
      // Count lessons completed today (for display)
      let lessonCount = 0
      const completed = await getCompletedLessons()
      for (const lessonIndex of completed) {
        const completionDay = await getProgress(PROGRESS_KEYS.lessonCompletion(lessonIndex))
        if (completionDay === dayKey) {
          lessonCount++
        }
      }
      
      setDailyLessonCount(lessonCount)
      
      // Check if ANY meaningful action happened today (lesson, review, or skip quiz)
      const hasAction = await hasMeaningfulActionToday()
      setHasCompletedToday(hasAction)
      
      // Store "1" if any meaningful action today, "0" otherwise
      // This is what the streak calculation uses
      await setDailyLessonCount(dayKey, hasAction ? 1 : 0)
      
      // Recalculate streak after updating daily count
      const calculatedStreak = await calculateStreak()
      setStreakDays(calculatedStreak)
      setWeeklyProgress(await calculateWeeklyProgress())
    } catch (e) {
      // Silent fail
    }
  }

  // Load daily lesson count on mount
  useEffect(() => {
    const update = async () => {
      await updateDailyLessonCount()
      const weekly = await calculateWeeklyProgress()
      setWeeklyProgress(weekly)
    }
    update()
  }, [])

  // Update count when completedLessons changes (when user completes a lesson)
  useEffect(() => {
    const handleUpdate = async () => {
      if (completedLessons.length > 0) {
        const dayKey = getCurrentDayKey()
        const previousCompleted = await getCompletedLessons()
        
        // Find newly completed lessons
        const newlyCompleted = completedLessons.filter(
          lessonIndex => !previousCompleted.includes(lessonIndex)
        )
        
        if (newlyCompleted.length > 0) {
          // Mark these lessons as completed today
          for (const lessonIndex of newlyCompleted) {
            await markLessonCompletedOnDate(lessonIndex, dayKey)
          }
          
          // Update the count
          await updateDailyLessonCount()
        }
      }
    }
    
    handleUpdate()
  }, [completedLessons])

  // Check for updates when window gains focus (in case lesson was completed in another tab)
  useEffect(() => {
    const handleFocus = async () => {
      await updateDailyLessonCount()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // Measure roadmap height and update spacer
  useEffect(() => {
    const measureRoadmap = () => {
      if (roadmapContainerRef.current) {
        const height = roadmapContainerRef.current.offsetHeight
        setRoadmapHeight(height)
      }
    }
    
    // Measure after initial render with a small delay to ensure layout is complete
    const timer = setTimeout(measureRoadmap, 100)
    
    // Re-measure on window resize
    window.addEventListener('resize', measureRoadmap)
    
    // Use ResizeObserver to detect content changes
    let resizeObserver
    if (roadmapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        measureRoadmap()
      })
      resizeObserver.observe(roadmapContainerRef.current)
    }
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', measureRoadmap)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [completedLessons, selectedIndex]) // Re-measure when content changes

  const lessonNames = [
    'Human Body Systems',
    'Cells',
    'Personalized Practice',
    'Review',
    'Tissues and Organs',
    'Skeletal System',
    'Muscular System',
    'Personalized Practice',
    'Nervous System',
    'Five Senses',
    'Personalized Practice',
    'Endocrine System',
    'Review',
    'Circulatory System',
    'Respiratory System',
    'Personalized Practice',
    'Digestive System',
    'Nutrition',
    'Personalized Practice',
    'Review',
    'Skin',
    'Immune System',
    'Personalized Practice',
    'Germs',
    'Vaccines and Antibiotics',
    'Personalized Practice',
    'Hygiene',
    'Review',
    'Exercise and Fitness',
    'Sleep and Growth',
    'Personalized Practice',
    'Oral Health',
    'Puberty and Reproduction',
    'Personalized Practice',
    'Review',
    'DNA and Heredity',
    'Cancer',
    'Personalized Practice',
    'Allergies',
    'Asthma',
    'Personalized Practice',
    'Medical Imaging',
    'Organ Transplants',
    'Personalized Practice',
    'Review'
  ]


  const units = [
    ['Unit 1: Foundations of Human Biology', 0, 3],
    ['Unit 2: Structure and Control of the Body', 4, 12],
    ['Unit 3: Transport and Energy in the Body', 13, 17], // Removed lessons 13, 14, 20 (now indices shifted)
    ['Unit 4: Protection and Immune Health', 18, 25],
    ['Unit 5: Growth and Everyday Health', 26, 32],
    ['Unit 6: Genetics and Modern Medicine', 33, 42]
  ]

  const getUnitForLesson = (index) => {
    for (let i = 0; i < units.length; i++) {
      if (index >= units[i][1] && index <= units[i][2]) {
        return i
      }
    }
    return 0
  }

  const getItemType = (index) => {
    const name = lessonNames[index]
    if (name === 'Personalized Practice') return 'personalizedPractice'
    if (name === 'Review') return 'review'
    return 'lesson'
  }

  // Get actual lesson ID from roadmap index
  // Only counts actual lessons, excludes Personalized Practice and Review
  const getActualLessonIndex = (index) => {
    let actualLessonId = 1
    for (let i = 0; i <= index; i++) {
      const name = lessonNames[i]
      if (name !== 'Personalized Practice' && name !== 'Review') {
        if (i === index) return actualLessonId
        actualLessonId++
      }
    }
    return actualLessonId
  }

  // Check quest progress - defined after units, getItemType, getActualLessonIndex
  const checkQuestProgress = useCallback(async () => {
    const today = new Date().toDateString()
    
    const prevQuests = dailyQuests
    if (prevQuests.length === 0) return
    
    const updatedQuests = prevQuests.map(quest => {
      if (quest.completed) return quest
      
      // Normalize progress - ensure it's always a number, not a date string
      let progress = 0
      if (typeof quest.progress === 'string' && quest.progress.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // If progress is a date string, reset it to 0
        progress = 0
      } else if (typeof quest.progress === 'number') {
        progress = quest.progress
      }
      
      let completed = false
      
      switch (quest.type) {
            case 'complete_review':
          // Check if any review was completed (total reviews completed)
          const reviewsCompleted = completedItems.filter(item => 
            typeof item === 'string' && item.startsWith('review_')
          ).length
          progress = reviewsCompleted
          completed = reviewsCompleted >= quest.target
          break
          
        case 'complete_unit':
          // Check if any unit is fully completed (all lessons in unit completed)
          let unitsCompleted = 0
          for (let i = 0; i < units.length; i++) {
            const [_, startIndex, endIndex] = units[i]
            let allLessonsCompleted = true
            for (let j = startIndex; j <= endIndex; j++) {
              const itemType = getItemType(j)
              if (itemType === 'lesson') {
                const lessonId = getActualLessonIndex(j)
                if (!completedLessons.includes(lessonId)) {
                  allLessonsCompleted = false
                  break
                }
              } else if (itemType === 'personalizedPractice') {
                if (!completedItems.includes(j)) {
                  allLessonsCompleted = false
                  break
                }
              }
            }
            if (allLessonsCompleted) unitsCompleted++
          }
          progress = unitsCompleted
          completed = unitsCompleted >= quest.target
          break
          
        case 'do_2_lessons':
        case 'do_1_lesson':
          // Ensure progress is always a number, not a date string
          progress = typeof dailyLessonCount === 'number' ? dailyLessonCount : 0
          completed = progress >= quest.target
          break
          
        case 'get_20xp':
        case 'get_10xp':
          progress = dailyXP
          completed = dailyXP >= quest.target
          break
      }
      
      return { ...quest, progress, completed }
    })
    
    // Filter out completed quests (they should disappear)
    const activeQuests = updatedQuests.filter(q => !q.completed)
    
    // Save updated quests (including completed ones for reference)
    await setProgress(PROGRESS_KEYS.dailyQuests(today), JSON.stringify(updatedQuests))
    // Only display active (non-completed) quests
    setDailyQuests(activeQuests)
  }, [completedLessons, completedItems, dailyXP, dailyLessonCount, dailyQuests])

  // Update quest progress when progress changes
  useEffect(() => {
    const updateQuests = async () => {
      if (dailyQuests.length > 0) {
        const today = new Date().toDateString()
        const prevQuests = dailyQuests
        
        const updatedQuests = prevQuests.map(quest => {
          if (quest.completed) {
            // Ensure completed quests also have numeric progress
            return {
              ...quest,
              progress: typeof quest.progress === 'number' ? quest.progress : 0
            }
          }
          
          // Normalize progress - ensure it's always a number, not a date string
          let progress = 0
          if (typeof quest.progress === 'string') {
            if (quest.progress.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // If progress is a date string, reset it to 0
              progress = 0
            } else {
              // Try to parse as number
              const parsed = parseInt(quest.progress, 10)
              progress = isNaN(parsed) ? 0 : parsed
            }
          } else if (typeof quest.progress === 'number') {
            progress = quest.progress
          }
          
          let completed = false
          
          switch (quest.type) {
            case 'complete_review':
              const reviewsCompleted = completedItems.filter(item => 
                typeof item === 'string' && item.startsWith('review_')
              ).length
              progress = reviewsCompleted
              completed = reviewsCompleted >= quest.target
              break
              
            case 'complete_unit':
              let unitsCompleted = 0
              for (let i = 0; i < units.length; i++) {
                const [_, startIndex, endIndex] = units[i]
                let allLessonsCompleted = true
                for (let j = startIndex; j <= endIndex; j++) {
                  const itemType = getItemType(j)
                  if (itemType === 'lesson') {
                    const lessonId = getActualLessonIndex(j)
                    if (!completedLessons.includes(lessonId)) {
                      allLessonsCompleted = false
                      break
                    }
                  } else if (itemType === 'personalizedPractice') {
                    if (!completedItems.includes(j)) {
                      allLessonsCompleted = false
                      break
                    }
                  }
                }
                if (allLessonsCompleted) unitsCompleted++
              }
              progress = unitsCompleted
              completed = unitsCompleted >= quest.target
              break
              
            case 'do_2_lessons':
            case 'do_1_lesson':
              progress = typeof dailyLessonCount === 'number' ? dailyLessonCount : 0
              completed = progress >= quest.target
              break
              
            case 'get_20xp':
            case 'get_10xp':
              progress = typeof dailyXP === 'number' ? dailyXP : 0
              completed = progress >= quest.target
              break
          }
          
          return { ...quest, progress, completed }
        })
        
        // Filter out completed quests (they should disappear)
        const activeQuests = updatedQuests.filter(q => !q.completed)
        
        // Only update if something changed
        const hasChanges = updatedQuests.some((q, i) => {
          const prev = prevQuests[i]
          return !prev || q.progress !== prev.progress || q.completed !== prev.completed
        })
        
        if (hasChanges) {
          // Save all quests (including completed ones for reference, but don't display them)
          await setProgress(PROGRESS_KEYS.dailyQuests(today), JSON.stringify(updatedQuests))
          // Only display active (non-completed) quests
          setDailyQuests(activeQuests)
        }
      }
    }
    
    updateQuests().catch(console.error)
  }, [completedLessons, completedItems, dailyXP, dailyLessonCount, dailyQuests.length])

  // Check if a unit has been reached (all previous units completed)
  const isUnitReached = (unitIndex) => {
    if (unitIndex === 0) return true // Unit 1 is always available
    
    // Check if all previous units are completed
    for (let i = 0; i < unitIndex; i++) {
      const [_, startIndex, endIndex] = units[i]
      // Check if at least one lesson in the previous unit is completed
      let hasCompletedLesson = false
      for (let j = startIndex; j <= endIndex; j++) {
        const itemType = getItemType(j)
        if (itemType === 'lesson') {
          const lessonId = getActualLessonIndex(j)
          if (completedLessons.includes(lessonId)) {
            hasCompletedLesson = true
            break
          }
        } else if (itemType === 'personalizedPractice') {
          if (completedItems.includes(j)) {
            hasCompletedLesson = true
            break
          }
        } else if (itemType === 'review') {
          // Reviews are stored as strings like "review_1", "review_2", etc.
          const reviewKey = `review_${i + 1}`
          if (completedItems.includes(reviewKey)) {
            hasCompletedLesson = true
            break
          }
        }
      }
      if (!hasCompletedLesson) {
        return false
      }
    }
    return true
  }

  const isSkipQuizCompleted = async (unitIndex) => {
    if (unitIndex < 2 || unitIndex > 6) return false
    const items = await getCompletedItems()
    return items.includes(`skipQuiz_${unitIndex + 1}`)
  }

  const getStatus = (index) => {
    const itemType = getItemType(index)
    
    if (itemType === 'review') {
      const unitIndex = getUnitForLesson(index)
      const reviewKey = `review_${unitIndex + 1}`
      if (completedItems.includes(reviewKey)) return 'completed'
    } else if (itemType === 'personalizedPractice') {
      if (completedItems.includes(index)) return 'completed'
    } else if (itemType === 'lesson') {
      const lessonId = getActualLessonIndex(index)
      if (completedLessons.includes(lessonId)) return 'completed'
    }
    
    let firstIncompleteIndex = -1
    for (let i = 0; i < lessonNames.length; i++) {
      const checkType = getItemType(i)
      let checkCompleted = false
      
      if (checkType === 'review') {
        const checkUnitIndex = getUnitForLesson(i)
        checkCompleted = completedItems.includes(`review_${checkUnitIndex + 1}`)
      } else if (checkType === 'personalizedPractice') {
        checkCompleted = completedItems.includes(i)
      } else if (checkType === 'lesson') {
        const checkLessonId = getActualLessonIndex(i)
        checkCompleted = completedLessons.includes(checkLessonId)
      }
      
      if (!checkCompleted) {
        firstIncompleteIndex = i
        break
      }
    }
    
    if (firstIncompleteIndex === -1) {
      return itemType === 'lesson' && completedLessons.includes(getActualLessonIndex(index)) ? 'completed' : 'locked'
    }
    
    if (index === firstIncompleteIndex) {
      if (itemType === 'lesson') {
        const lessonId = getActualLessonIndex(index)
        if (lessonId === 1) return 'available'
        
        for (let i = index - 1; i >= 0; i--) {
          const prevType = getItemType(i)
          if (prevType === 'lesson') {
            const prevLessonId = getActualLessonIndex(i)
            if (completedLessons.includes(prevLessonId)) return 'available'
            return 'locked'
          } else if (prevType === 'personalizedPractice') {
            if (completedItems.includes(i)) return 'available'
            return 'locked'
          } else if (prevType === 'review') {
            const prevUnitIndex = getUnitForLesson(i)
            if (completedItems.includes(`review_${prevUnitIndex + 1}`)) return 'available'
            return 'locked'
          }
        }
        return 'locked'
      } else if (itemType === 'personalizedPractice') {
        const previousLessons = []
        for (let i = index - 1; i >= 0 && previousLessons.length < 2; i--) {
          const name = lessonNames[i]
          if (name !== 'Personalized Practice' && name !== 'Review') {
            const lessonId = getActualLessonIndex(i)
            previousLessons.unshift(lessonId)
          }
        }
        if (previousLessons.length < 2) return 'locked'
        const bothCompleted = previousLessons.every(lessonId => completedLessons.includes(lessonId))
        return bothCompleted ? 'available' : 'locked'
      } else if (itemType === 'review') {
        for (let i = index - 1; i >= 0; i--) {
          const prevType = getItemType(i)
          if (prevType === 'lesson') {
            const prevLessonId = getActualLessonIndex(i)
            if (completedLessons.includes(prevLessonId)) return 'available'
            return 'locked'
          } else if (prevType === 'personalizedPractice') {
            if (completedItems.includes(i)) return 'available'
            return 'locked'
          }
        }
        return 'locked'
      }
    }
    
    return 'locked'
  }

  useEffect(() => {
    const onScroll = () => {
      if (!showSheetFor) return
      const delta = window.scrollY - sheetAnchorScroll
      setIsSheetHidden(Math.abs(delta) > 500)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [showSheetFor, sheetAnchorScroll])

  // Calculate initial sticky header position after layout to prevent squashing on load
  useLayoutEffect(() => {
    const calculateInitialPosition = () => {
      const stickyHeader = document.querySelector('[data-sticky-unit-header]')
      if (stickyHeader && stickyHeaderOriginalTop.current === null) {
        // Force a reflow to ensure layout is complete
        stickyHeader.offsetHeight
        const rect = stickyHeader.getBoundingClientRect()
        // Header has marginTop: 350px, so its document position is: window.scrollY + rect.top
        // rect.top is the viewport position, so document position = window.scrollY + rect.top
        stickyHeaderOriginalTop.current = window.scrollY + rect.top
      }
    }
    
    // Calculate after layout is complete - use multiple attempts to ensure it works
    requestAnimationFrame(() => {
      calculateInitialPosition()
      setTimeout(calculateInitialPosition, 50)
      setTimeout(calculateInitialPosition, 200)
      setTimeout(calculateInitialPosition, 500)
    })
  }, [])

  // Ensure page starts at top on mount and header starts unpinned
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    setIsStickyPinned(false) // Explicitly start unpinned
  }, [])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        const stickyHeader = document.querySelector('[data-sticky-unit-header]')
        
        // Recalculate header position if not set
        if (stickyHeader && stickyHeaderOriginalTop.current === null) {
          const rect = stickyHeader.getBoundingClientRect()
          // Header has marginTop: 350px, so its document position is: scrollY + rect.top
          // rect.top is the viewport position, so document position = scrollY + rect.top
          stickyHeaderOriginalTop.current = scrollY + rect.top
        }
        
        // Use hysteresis to prevent glitching when scrolling up/down near threshold
        const headerActualTop = stickyHeaderOriginalTop.current
        if (headerActualTop === null || headerActualTop <= 0) {
          // Don't pin if we don't have a valid header position yet - keep it in normal flow
          setIsStickyPinned(false)
          ticking = false
          return
        }
        
        // Calculate when header would reach a certain point from top
        // headerActualTop is the document position where header would naturally be
        // When scrolling, header's viewport position = headerActualTop - scrollY
        // We want to pin when header is about to scroll off (when it reaches a small offset from top)
        // Pin earlier by using a larger offset
        const pinOffset = 200  // Pin when header is 200px from viewport top (balanced timing)
        const pinThreshold = Math.max(40, headerActualTop - pinOffset)  // Require at least 40px scroll
        const unpinThreshold = Math.max(20, headerActualTop - (pinOffset + 20))  // Unpin slightly earlier
        
        // At scrollY = 0, always keep it unpinned (normal flow)
        if (scrollY === 0) {
          setIsStickyPinned(false)
          ticking = false
          return
        }
        
        let pinned = false
        if (isStickyPinned) {
          // Currently pinned (fixed) - only unpin if we scroll back up above unpin threshold
          pinned = scrollY > unpinThreshold
        } else {
          // Currently not pinned - only pin if we scroll past the pin threshold
          pinned = scrollY >= pinThreshold
        }
        
        setIsStickyPinned(pinned)
        ticking = false
        
        // Determine active unit by checking which unit container is visible
        let newActiveUnit = 0
        const viewportTop = scrollY
        const viewportCenter = scrollY + window.innerHeight / 2
        
        // Check each unit container to find which one is most visible
        for (let i = 0; i < units.length; i++) {
          const container = unitContainerRefs.current[i]
          if (container) {
            const rect = container.getBoundingClientRect()
            const containerTop = scrollY + rect.top
            const containerBottom = scrollY + rect.bottom
            
            // If the container's top is above or at the viewport center, we're in this unit
            // This makes it update earlier as you scroll into a unit
            if (containerTop <= viewportCenter && containerBottom > viewportTop) {
              newActiveUnit = i
            }
          }
        }
        
        setActiveUnitIndex(newActiveUnit)
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [units.length])

  const handleSelect = (index, lessonName) => {
    const itemType = getItemType(index)
    const status = getStatus(index)
    
    // Check if this is a skip icon - if so, navigate directly to skip quiz (skip icons are always available)
    const unitIndex = getUnitForLesson(index)
    const unitStartIndex = units[unitIndex][1]
    const relativeIndex = index - unitStartIndex
    
    if (unitIndex >= 1 && unitIndex <= 5 && relativeIndex === 0 && itemType === 'lesson') {
      // Check if skip icon should be shown (unit not reached AND skip quiz not completed)
      if (!isUnitReached(unitIndex) && !isSkipQuizCompleted(unitIndex)) {
        // Navigate to pricing page (unit skip is a pro feature)
        navigate('/pricing')
        return
      }
    }
    
    setSelectedIndex(index)
    setShowSheetFor({ index, name: lessonName, status })
    setSheetAnchorScroll(window.scrollY)
    // Kick off entrance animation from bottom
    setIsSheetHidden(true)
    requestAnimationFrame(() => {
      setIsSheetHidden(false)
    })
    // Scroll the selected row into center view (vertical only, preserve horizontal scroll)
    const node = rowRefs.current[index]
    if (node) {
      const rect = node.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const elementTop = rect.top + scrollTop
      const elementHeight = rect.height
      const windowHeight = window.innerHeight
      const targetScroll = elementTop - (windowHeight / 2) + (elementHeight / 2)
      
      // Only scroll vertically, preserve horizontal scroll position
      window.scrollTo({
        top: targetScroll,
        left: window.scrollX || document.documentElement.scrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handleStartLesson = (index) => {
    const itemType = getItemType(index)
    const status = getStatus(index)
    
    // Check if this is a skip icon (first lesson of units 2-6 when unit not reached)
    const unitIndex = getUnitForLesson(index)
    const unitStartIndex = units[unitIndex][1]
    const relativeIndex = index - unitStartIndex
    
    // If this is the first lesson of units 2-6 and should show skip icon, always navigate to pricing
    if (unitIndex >= 1 && unitIndex <= 5 && relativeIndex === 0 && itemType === 'lesson') {
      // Check if skip icon should be shown (unit not reached AND skip quiz not completed)
      if (!isUnitReached(unitIndex) && !isSkipQuizCompleted(unitIndex)) {
        // Navigate to pricing page (unit skip is a pro feature)
        navigate('/pricing')
        return
      }
    }
    
    // Personalized Practice items navigate to practice page
    if (itemType === 'personalizedPractice') {
      navigate(`/practice/${index}`)
      return
    }
    
    // Review items navigate to review page
    if (itemType === 'review') {
      navigate(`/review/${unitIndex + 1}`)
      return
    }
    
    if (status === 'available' || status === 'completed') {
      const lessonId = getActualLessonIndex(index)
      if (status === 'completed') {
        navigate(`/lesson/${lessonId}/practice`)
      } else {
        navigate(`/lesson/${lessonId}`)
      }
    }
  }

  // Reload progress when navigating back to this page (route change)
  useEffect(() => {
    // Reload progress when location changes (navigating back from lesson)
    if (location.pathname === '/testsecurev2') {
      loadUserProgress()
      
      loadCompletedItems()
    }
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  
  useEffect(() => {
    const reloadAllProgress = () => {
      loadUserProgress()
      loadCompletedItems()
    }
    
    const handleFocus = () => {
      reloadAllProgress()
    }
    
    // Reload on mount and when window gains focus
    reloadAllProgress()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
      position: 'relative',
      overflowX: 'visible',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 280px',
        gap: '40px',
        paddingTop: '0px',
        paddingBottom: '40px',
        width: '100%',
        position: 'relative',
        maxWidth: '100%',
        boxSizing: 'border-box',
        paddingLeft: '0px',
        paddingRight: '40px',
        margin: '0 auto',
        alignItems: 'start'
      }}>
        {/* Left Sidebar - Fixed */}
        <div style={{
          position: 'sticky',
          top: '0px',
          alignSelf: 'start',
          width: '200px',
          height: 'auto',
          pointerEvents: 'none',
          zIndex: 100,
          marginLeft: '120px',
          overflow: 'visible',
          gridColumn: '1'
        }}>
          <div style={{
            position: 'fixed',
            top: '40px',
            left: '40px',
            zIndex: 1001,
            pointerEvents: 'auto',
            width: 'auto',
            height: 'auto'
          }}>
            <img
              src="/logo.svg"
              alt="Logo"
              style={{
                height: '40.8px',
                width: 'auto',
                display: 'block',
                filter: 'drop-shadow(0 0 0 transparent)'
              }}
            />
          </div>
          <div style={{
            position: 'fixed',
            left: '280px',
            top: '0px',
            width: '2pt',
            height: '100vh',
            backgroundColor: isLightMode ? '#d0d1d2' : '#4a5568',
            zIndex: 99
          }} />
          <SidebarNavigation isLightMode={isLightMode} />
        </div>
        
        {/* Main Content Area */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gridColumn: '2',
          minWidth: 0,
          paddingTop: '0px',
          marginTop: '-280px',
          alignSelf: 'start'
        }}>
        <div 
          data-sticky-unit-header
            style={{ 
            position: isStickyPinned ? 'fixed' : 'relative',
            top: isStickyPinned ? '30px' : 'auto',
            marginTop: isStickyPinned ? '0px' : '350px', // 70px from top + 280px to offset parent's negative margin
            marginBottom: '0px',
            left: isStickyPinned ? '50%' : 'auto',
            right: isStickyPinned ? 'auto' : 'auto',
            transform: isStickyPinned ? 'translateX(calc(-50% - 50px))' : 'translateX(0px)',
            width: '100%',
            zIndex: 1000,
            paddingTop: '0px',
            paddingBottom: '0px',
            paddingLeft: '0px',
            paddingRight: '0px',
            marginBottom: isStickyPinned ? '0px' : '0px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            pointerEvents: 'none',
            alignSelf: 'stretch',
            transition: 'none'
          }}
        >
          <div style={{
            backgroundColor: '#2563eb',
            borderRadius: '12px',
            padding: '20px 32px',
            width: '600px',
            maxWidth: '600px',
            minWidth: '600px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            pointerEvents: 'auto',
            boxSizing: 'border-box',
            flexShrink: 0,
            transform: isStickyPinned ? 'none' : 'translateX(-50px)'
          }}>
            <p style={{
              color: '#5e8ef7',
              fontSize: '14px',
              fontWeight: 400,
              fontFamily: "'Inter Tight', sans-serif",
              margin: 0,
              marginBottom: '4px'
            }}>
              Pre-Medical, Unit {activeUnitIndex + 1}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              minWidth: 0,
              flexShrink: 1
            }}>
              <h2 style={{
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                fontFamily: "'Unbounded', sans-serif",
                margin: 0,
                whiteSpace: 'normal',
                flex: '1 1 auto',
                minWidth: 0,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.4'
              }}>
                {units[activeUnitIndex]?.[0] || (units[0] && units[0][0]) || 'Loading...'}
              </h2>
              <a
                href={`/unit/${activeUnitIndex + 1}`}
                onClick={(e) => {
                  e.preventDefault()
                  navigate(`/unit/${activeUnitIndex + 1}`)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                <img
                  src="/diary-bookmark-down.png"
                  alt="View Unit Content"
                  style={{
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain'
                  }}
                />
              </a>
            </div>
          </div>
        </div>
        {isStickyPinned && (
          <div style={{
            height: '92px',
            width: '100%',
            flexShrink: 0
          }} />
        )}
        {/* Spacer to prevent roadmap jump when header becomes sticky */}
        {isStickyPinned && (
          <div style={{
            height: '350px', // Match the header's marginTop when unpinned
            width: '100%',
            flexShrink: 0
          }} />
        )}
        <div 
          ref={roadmapContainerRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%',
            marginTop: '40px', // Space between unit header and first lesson
            transform: 'translateX(-50px)'
          }}>
        {units.map(([unitName, startIndex, endIndex], unitIndex) => {
          const unitLessons = lessonNames.slice(startIndex, endIndex + 1)
          const unitStartLessonIndex = startIndex
          
          return (
            <React.Fragment key={`unit-${unitIndex}`}>
              {unitIndex > 0 && (
                <div
                  ref={(el) => { unitDividerRefs.current[unitIndex] = el }}
            style={{ 
                    width: '64%',
                    maxWidth: '640px',
                    margin: '40px auto',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Full width line */}
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    right: '0',
                    width: '100%',
                    height: '2px',
                    backgroundColor: isLightMode ? '#d0d1d2' : '#4a5568',
                    zIndex: 0
                  }} />
                  {/* Text overlay with background to create gap effect */}
                  <div style={{
                    position: 'relative',
                    backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
                    padding: '0 16px',
                    color: isLightMode ? '#d0d1d2' : '#4a5568',
                    fontFamily: "'Unbounded', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 1
                  }}>
                    {unitName.replace(/^Unit \d+: /, '')}
                  </div>
                </div>
              )}
              
              <div
                ref={(el) => { unitContainerRefs.current[unitIndex] = el }}
                data-unit-container={unitIndex}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '32px'
                }}
              >
              
              {/* Render all lessons in this unit */}
              {unitLessons.map((lessonName, relativeIndex) => {
                const index = unitStartLessonIndex + relativeIndex
                
                return (
                  <div
                    key={`lesson-${index}-${forceUpdate}`}
                    ref={(el) => { rowRefs.current[index] = el }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `translateX(${getXOffset(index)}px)`,
                      transition: 'transform 0.25s ease-out',
                      width: '100%'
                    }}
                  >
                {(() => {
                  const itemType = getItemType(index)
                  const status = getStatus(index)
                  const isSelected = selectedIndex === index
                  const isPressed = pressedIndex === index && !isSelected
          
                  let baseIcon = 'futurelesson'
                  
                  // Check if this is the first lesson of units 2-6 (skipicon)
                  // Show skip icon only if unit not reached AND skip quiz not completed
                  if (unitIndex >= 1 && unitIndex <= 5 && relativeIndex === 0 && itemType === 'lesson') {
                    const skipQuizDone = isSkipQuizCompleted(unitIndex)
                    
                    const unitReached = isUnitReached(unitIndex)
                    if (!unitReached && !skipQuizDone) {
                      baseIcon = 'skipicon'
                    } else {
                      // Regular lesson icons
                      if (status === 'completed') baseIcon = 'completedlesson'
                      else if (status === 'available') baseIcon = 'currentlesson'
                    }
                  } else if (itemType === 'personalizedPractice') {
                    if (status === 'completed') baseIcon = 'completedlesson'
                    else if (status === 'available') baseIcon = 'currentlesson'
                    else baseIcon = 'reviewlesson' // locked
                  } else if (itemType === 'review') {
                    // Check if review is completed
                    const reviewUnitIndex = getUnitForLesson(index)
                    const reviewKey = `review_${reviewUnitIndex + 1}`
                    const isReviewCompleted = completedItems.includes(reviewKey)
                    
                    if (isReviewCompleted) {
                      baseIcon = 'completedlesson'
                    } else if (status === 'available') {
                      baseIcon = 'currentlesson'
                    } else {
                      baseIcon = 'examlesson' // locked
                    }
                  } else {
                    if (status === 'completed') {
                      baseIcon = 'completedlesson'
                    } else if (status === 'available') {
                      baseIcon = 'currentlesson'
                    }
                  }
                  
                  let iconSrc
                  // All icons (including skip icons) are in lesson-icons folder
                  const lightSuffix = isLightMode ? '(light)' : ''
                  if (isSelected) iconSrc = `/lesson-icons/${baseIcon}selected${lightSuffix}.svg`
                  else if (isPressed) iconSrc = `/lesson-icons/${baseIcon}pressed${lightSuffix}.svg`
                  else iconSrc = `/lesson-icons/${baseIcon}${lightSuffix}.svg`
          
                  // Skip icon is always available (not locked)
                  const isSkipIcon = baseIcon === 'skipicon'
                  const isClickable = isSkipIcon || status === 'available' || status === 'completed'
                  // Allow clicking on all items (including locked) to show information in bottom sheet
          
                  return (
              <div 
                style={{
                  width: '108.8px',
                  height: '108.8px',
                  cursor: 'pointer',
                  opacity: 1
                }}
                      onMouseDown={() => !isSelected && setPressedIndex(index)}
                      onMouseUp={() => {
                        setPressedIndex(null)
                        handleSelect(index, lessonName)
                      }}
                      onMouseLeave={() => pressedIndex === index && setPressedIndex(null)}
                      onTouchStart={() => !isSelected && setPressedIndex(index)}
                      onTouchEnd={() => {
                        setPressedIndex(null)
                        handleSelect(index, lessonName)
                      }}
                      onClick={() => handleSelect(index, lessonName)}
                    >
                      <img
                        src={iconSrc}
                        alt={lessonName}
                        draggable="false"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain', 
                          pointerEvents: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          MozUserSelect: 'none'
                        }}
                      />
                    </div>
                  )
                })()}
                  </div>
                )
              })}
              </div>
            </React.Fragment>
          )
        })}
        </div>
        </div>
        
        {/* Right Sidebars Container */}
        <div style={{
          gridColumn: '3',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignSelf: 'start',
          marginLeft: 'auto',
          transform: 'translateX(-70px)',
          position: 'relative',
          height: roadmapHeight > 0 ? `${roadmapHeight + 250}px` : 'fit-content'
        }}>
        {/* Right Sidebar Box - Sticky */}
        <div style={{
          position: 'sticky',
          top: '80px',
          alignSelf: 'flex-start',
          width: '350px',
          height: 'calc((100vh - 160px) / 2)',
          maxHeight: 'calc((100vh - 160px) / 2)',
          zIndex: 100,
          overflow: 'visible',
          flexShrink: 0
        }}>
        <div style={{
          backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
          border: `2pt solid ${isLightMode ? '#d0d1d2' : '#4a5568'}`,
          borderRadius: '12px',
          padding: '20px',
          width: '100%',
          height: '100%',
          maxHeight: 'calc((100vh - 160px) / 2)',
          overflowY: 'auto',
          overflowX: 'visible',
          boxSizing: 'border-box'
        }}>
          {/* Daily Lesson Counter */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '20px',
            marginLeft: '0px',
            paddingLeft: '20px',
            width: 'calc(100% - 20px)',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                color: isLightMode ? '#000000' : '#ffffff',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '1'
              }}>
                {streakDays}
              </span>
              <img
                src={hasCompletedToday 
                  ? '/flamelit.png' 
                  : (isLightMode ? '/streakicon(light).png' : '/flame.png')}
                alt={hasCompletedToday ? 'Flame Lit' : 'Flame'}
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {streakDays === 0 && (
                <span style={{
                  color: isLightMode ? '#000000' : '#ffffff',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400
                }}>
                  Complete <strong>1 Lesson</strong> to start a streak
                </span>
              )}
              {streakDays > 0 && !hasCompletedToday && (
                <span style={{
                  color: isLightMode ? '#000000' : '#ffffff',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400
                }}>
                  Complete <strong>1 Lesson</strong> to maintain your streak
                </span>
              )}
              {streakDays > 0 && hasCompletedToday && (
                <span style={{
                  color: isLightMode ? '#000000' : '#ffffff',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '16px',
                  fontWeight: 400
                }}>
                  Keep practicing every day to maintain your streak!
                </span>
              )}
            </div>
          </div>
          {/* Simple Box - Centered in sidebar */}
          <div style={{
            marginTop: '24px',
            width: '100%',
            height: '80px',
              borderRadius: '8px',
            backgroundColor: hasCompletedToday 
              ? '#2563eb' 
              : (isLightMode ? '#e3e3e3ff' : '#3b4652'),
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* 5 Circles Row with Day Letters */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              width: 'calc(100% + 96px)',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}>
              <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {(() => {
                  const now = new Date()
                  const currentDayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                  
                  // Show 5 days with current day in the center (position 2)
                  // Need 2 days before and 2 days after
                  const centerPosition = 2
                  const daysToShow = []
                  
                  // Build array: [day-2, day-1, currentDay, day+1, day+2]
                  for (let i = -2; i <= 2; i++) {
                    let dayIndex = currentDayOfWeek + i
                    // Wrap around if needed (0-6 range)
                    if (dayIndex < 0) dayIndex += 7
                    if (dayIndex > 6) dayIndex -= 7
                    daysToShow.push(dayIndex)
                  }
                  
                  // Current day is always at center position (2)
                  const actualCurrentPosition = centerPosition
                  
                  return daysToShow.map((dayOfWeek, index) => {
                    // Calculate date offset for this day
                    const dayOffset = dayOfWeek - currentDayOfWeek
                    // Handle week wrap-around
                    let adjustedOffset = dayOffset
                    if (adjustedOffset > 3) adjustedOffset -= 7
                    if (adjustedOffset < -3) adjustedOffset += 7
                    
                    const checkDate = new Date(now)
                    checkDate.setDate(now.getDate() + adjustedOffset)
                    const dateKey = getDayKey(checkDate)
                    const isCompleted = weeklyProgress[dateKey] || false
                    // Only the current day should be bright, all others dim
                    const isCurrentDay = dayOfWeek === currentDayOfWeek
                    const isMiddleCircle = index === actualCurrentPosition
                    const isStreakDoneToday = hasCompletedToday && isMiddleCircle
                    const isPastCompletedDay = isCompleted && !isCurrentDay
                    
                    // Day letters: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
                    const dayLetters = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'T', 5: 'F', 6: 'S' }
                    const dayLetter = dayLetters[dayOfWeek] || 'M'
                    
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isStreakDoneToday 
                              ? '#ffffff' 
                              : (isPastCompletedDay 
                                  ? '#2563eb' 
                                  : (isLightMode ? '#ffffff' : '#161d25ff')),
                            border: !isStreakDoneToday && !isPastCompletedDay && isLightMode 
                              ? '2px solid #e3e3e3ff' 
                              : 'none',
                            flexShrink: 0,
                            zIndex: 1,
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isStreakDoneToday && (
                            <img
                              src="/check.png"
                              alt="Completed"
                              style={{
                                width: '50%',
                                height: '50%',
                                objectFit: 'contain',
                                position: 'absolute',
                                zIndex: 2
                              }}
                            />
                          )}
                          {isPastCompletedDay && (
                            <img
                              src="/whitecheck.png"
                              alt="Completed"
                              style={{
                                width: '50%',
                                height: '50%',
                                objectFit: 'contain',
                                position: 'absolute',
                                zIndex: 2
                              }}
                            />
                          )}
                        </div>
                        <span style={{
                          color: isLightMode ? '#000000' : '#ffffff',
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          opacity: isCurrentDay ? 1 : 0.4
                        }}>
                          {dayLetter}
                        </span>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
            {/* Left fade gradient - positioned at sidebar edge */}
            <div style={{
              position: 'absolute',
              left: '-20px',
              top: '0',
              width: '120px',
              height: '100%',
              background: isLightMode 
                ? 'linear-gradient(to right, #ffffff 0%, #ffffff 30%, transparent 100%)'
                : 'linear-gradient(to right, #161d25ff 0%, #161d25ff 30%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 2
            }} />
            {/* Right fade gradient - positioned at sidebar edge */}
            <div style={{
              position: 'absolute',
              right: '-20px',
              top: '0',
              width: '120px',
              height: '100%',
              background: isLightMode 
                ? 'linear-gradient(to left, #ffffff 0%, #ffffff 30%, transparent 100%)'
                : 'linear-gradient(to left, #161d25ff 0%, #161d25ff 30%, transparent 100%)',
              pointerEvents: 'none',
              zIndex: 2
            }} />
          </div>
        </div>
        </div>
        
        {/* Quest Sidebar Box - Sticky (Empty) */}
        <div style={{
          position: 'sticky',
          top: 'calc(80px + (100vh - 160px) / 2 + 20px)',
          alignSelf: 'flex-start',
          width: '350px',
          height: 'calc((100vh - 160px) / 2)',
          maxHeight: 'calc((100vh - 160px) / 2)',
          zIndex: 100,
          overflow: 'visible',
          marginTop: '0px',
          flexShrink: 0
        }}>
        <div style={{
          backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
          border: `2pt solid ${isLightMode ? '#d0d1d2' : '#4a5568'}`,
          borderRadius: '12px',
          padding: '20px',
          width: '100%',
          height: '100%',
          maxHeight: 'calc((100vh - 160px) / 2)',
          overflowY: 'auto',
          overflowX: 'visible',
          boxSizing: 'border-box'
        }}>
          {/* Quest Sidebar Header */}
          <div style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: `2pt solid ${isLightMode ? '#d0d1d2' : '#4a5568'}`
          }}>
            <h3 style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: isLightMode ? '#000000' : '#ffffff',
              margin: '0 0 8px 0'
            }}>
              Daily Quest
            </h3>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: isLightMode ? '#666666' : '#9ca3af',
              margin: 0
            }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Quest List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {dailyQuests.map((quest) => (
              <div
                key={quest.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: quest.completed 
                    ? (isLightMode ? '#d1fae5' : '#064e3b')
                    : (isLightMode ? '#f9fafb' : '#1f2937'),
                  border: `2pt solid ${quest.completed 
                    ? '#10b981' 
                    : (isLightMode ? '#e5e7eb' : '#374151')}`,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '14px',
                    fontWeight: 600,
                    color: quest.completed 
                      ? '#10b981'
                      : (isLightMode ? '#000000' : '#ffffff')
                  }}>
                    {quest.label}
                  </span>
                  {quest.completed && (
                    <span style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#10b981'
                    }}>
                      ✓
                    </span>
                  )}
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: isLightMode ? '#e5e7eb' : '#374151',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, ((typeof quest.progress === 'number' ? quest.progress : 0) / quest.target) * 100)}%`,
                    height: '100%',
                    backgroundColor: quest.completed ? '#10b981' : '#2563eb',
                    transition: 'width 0.3s ease',
                    borderRadius: '3px'
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '6px'
                }}>
                  <span style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '11px',
                    fontWeight: 400,
                    color: isLightMode ? '#666666' : '#9ca3af'
                  }}>
                    {typeof quest.progress === 'number' ? quest.progress : 0} / {quest.target}
                  </span>
                  {quest.completed && (
                    <span style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#10b981'
                    }}>
                      Completed!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        {/* No spacer needed - container height is set directly above */}
        </div>
      </div>
      
      {/* Bottom sheet for selected lesson */}
      {showSheetFor && (
        <div
            style={{ 
            position: 'fixed',
            left: '50%',
            bottom: '48px',
            transform: `translateX(calc(-50% - 50px)) translateY(${isSheetHidden ? '140%' : '0'})`,
            width: '666.67px',
            maxWidth: '666.67px',
            height: '133.33px',
            backgroundImage: isLightMode 
              ? "url('/lessondescbetter(light).svg')" 
              : "url('/lessondescbetter.svg')",
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0',
            boxShadow: 'none',
            padding: '16px 24px',
            transition: 'transform 0.3s ease',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', width: '100%', marginTop: '20px' }}>
            <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '16pt', fontWeight: 600, color: isLightMode ? '#000000' : '#ffffff', textAlign: 'center' }}>
              {showSheetFor.name}
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: 'auto', paddingTop: '0px', paddingBottom: '12px' }}>
            {(() => {
              const itemType = getItemType(showSheetFor.index)
              
              // Show locked button for locked items (including personalized practices and reviews)
              if (showSheetFor.status === 'locked') {
                return (
                  <div style={{ width: '80%', maxWidth: '533.33px', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={isLightMode ? '/locked(light).svg' : '/locked.svg'} 
                      alt="Locked" 
                      draggable="false"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }} 
                    />
                  </div>
                )
              }
              
              // Show start button for available personalized practices
              if (itemType === 'personalizedPractice' && showSheetFor.status === 'available') {
                return (
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      width: '80%',
                      maxWidth: '533.33px'
                    }}
                    onMouseDown={() => setIsStartPressed(true)}
                    onMouseUp={() => setIsStartPressed(false)}
                    onMouseLeave={() => setIsStartPressed(false)}
                    onTouchStart={() => setIsStartPressed(true)}
                    onTouchEnd={() => setIsStartPressed(false)}
                    onClick={() => handleStartLesson(showSheetFor.index)}
                  >
                    <img 
                      src={isStartPressed 
                        ? (isLightMode ? '/startpressed(light).svg' : '/startpressed.svg')
                        : (isLightMode ? '/start(light).svg' : '/start.svg')} 
                      alt="Start Practice" 
                      draggable="false"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block', 
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }} 
                    />
                  </button>
                )
              }
              
              // Regular lessons - show start button for available
              if (showSheetFor.status === 'available') {
                return (
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      width: '80%',
                      maxWidth: '533.33px'
                    }}
                    onMouseDown={() => setIsStartPressed(true)}
                    onMouseUp={() => setIsStartPressed(false)}
                    onMouseLeave={() => setIsStartPressed(false)}
                    onTouchStart={() => setIsStartPressed(true)}
                    onTouchEnd={() => setIsStartPressed(false)}
                    onClick={() => handleStartLesson(showSheetFor.index)}
                  >
                    <img 
                      src={isStartPressed 
                        ? (isLightMode ? '/startpressed(light).svg' : '/startpressed.svg')
                        : (isLightMode ? '/start(light).svg' : '/start.svg')} 
                      alt="Start Lesson" 
                      draggable="false"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block', 
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }} 
                    />
                  </button>
                )
              }
              
              if (showSheetFor.status === 'completed') {
                return (
                  <button
                    key="practice-button"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      width: '80%',
                      maxWidth: '533.33px'
                    }}
                    onMouseDown={() => setIsPracticePressed(true)}
                    onMouseUp={() => setIsPracticePressed(false)}
                    onMouseLeave={() => setIsPracticePressed(false)}
                    onTouchStart={() => setIsPracticePressed(true)}
                    onTouchEnd={() => setIsPracticePressed(false)}
                    onClick={() => handleStartLesson(showSheetFor.index)}
                  >
                    <img 
                      src={isPracticePressed 
                        ? (isLightMode ? '/practicepressed(light).svg' : '/practicepressed.svg')
                        : (isLightMode ? '/practice(light).svg' : '/practice.svg')} 
                      alt="Practice Lesson" 
                      draggable="false"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block', 
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }} 
                    />
                  </button>
                )
              }
              
              if (showSheetFor.status === 'available') {
                return (
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      width: '80%',
                      maxWidth: '533.33px'
                    }}
                    onMouseDown={() => setIsStartPressed(true)}
                    onMouseUp={() => setIsStartPressed(false)}
                    onMouseLeave={() => setIsStartPressed(false)}
                    onTouchStart={() => setIsStartPressed(true)}
                    onTouchEnd={() => setIsStartPressed(false)}
                    onClick={() => handleStartLesson(showSheetFor.index)}
                  >
                    <img 
                      src={isStartPressed 
                        ? (isLightMode ? '/startpressed(light).svg' : '/startpressed.svg')
                        : (isLightMode ? '/start(light).svg' : '/start.svg')} 
                      alt="Start Lesson" 
                      draggable="false"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        display: 'block', 
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none'
                      }} 
                    />
                  </button>
                )
              }
              
              return null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestSecureV2
