/**
 * Analytics Tracker
 * Tracks analytical data only when analytical cookies are enabled
 */

import { isCookieCategoryAllowed, COOKIE_CATEGORIES } from './cookieManager'

// Storage keys
const FLAGGED_QUESTIONS_KEY = 'analytics_flagged_questions'
const DROP_OFFS_KEY = 'analytics_drop_offs'
const SESSION_DATA_KEY = 'analytics_session_data'
const RETENTION_DATA_KEY = 'analytics_retention_data'
const SESSION_ID_KEY = 'analytics_session_id'
const USER_ID_KEY = 'analytics_user_id'

/**
 * Check if analytics tracking is enabled
 */
const isAnalyticsEnabled = () => {
  return isCookieCategoryAllowed(COOKIE_CATEGORIES.ANALYTICAL)
}

/**
 * Get or create session ID
 */
const getSessionId = () => {
  if (!isAnalyticsEnabled()) return null
  
  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(SESSION_ID_KEY, sessionId)
    }
    return sessionId
  } catch (e) {
    return null
  }
}

/**
 * Get or create user ID (anonymous)
 */
const getUserId = () => {
  if (!isAnalyticsEnabled()) return null
  
  try {
    let userId = localStorage.getItem(USER_ID_KEY)
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(USER_ID_KEY, userId)
    }
    return userId
  } catch (e) {
    return null
  }
}

/**
 * Track a flagged question
 */
export const trackFlaggedQuestion = (lessonId, questionIndex, reason) => {
  if (!isAnalyticsEnabled()) return

  try {
    const flagged = JSON.parse(localStorage.getItem(FLAGGED_QUESTIONS_KEY) || '[]')
    flagged.push({
      lessonId,
      questionIndex,
      reason,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId()
    })
    localStorage.setItem(FLAGGED_QUESTIONS_KEY, JSON.stringify(flagged))
  } catch (e) {
    console.error('Failed to track flagged question', e)
  }
}

/**
 * Track a lesson drop-off point
 */
export const trackLessonDropOff = (lessonId, step, timeSpent) => {
  if (!isAnalyticsEnabled()) return

  try {
    const dropOffs = JSON.parse(localStorage.getItem(DROP_OFFS_KEY) || '[]')
    dropOffs.push({
      lessonId,
      step, // e.g., 'content', 'task', 'follow-up', 'quiz'
      timeSpent, // seconds
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getUserId()
    })
    localStorage.setItem(DROP_OFFS_KEY, JSON.stringify(dropOffs))
  } catch (e) {
    console.error('Failed to track drop-off', e)
  }
}

/**
 * Track session activity
 */
let sessionStartTime = null
let lastActivityTime = null
let activityIntervals = []

/**
 * Start tracking a session
 */
export const startSessionTracking = () => {
  if (!isAnalyticsEnabled()) return
  
  sessionStartTime = Date.now()
  lastActivityTime = Date.now()
  activityIntervals = []
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Track user activity (mouse movement, clicks, keyboard)
  document.addEventListener('mousemove', updateActivity)
  document.addEventListener('click', updateActivity)
  document.addEventListener('keydown', updateActivity)
  document.addEventListener('scroll', updateActivity)
}

/**
 * Stop tracking a session
 */
export const stopSessionTracking = () => {
  if (!isAnalyticsEnabled() || !sessionStartTime) return
  
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.removeEventListener('mousemove', updateActivity)
  document.removeEventListener('click', updateActivity)
  document.removeEventListener('keydown', updateActivity)
  document.removeEventListener('scroll', updateActivity)
  
  // Save session data
  saveSessionData()
  
  sessionStartTime = null
  lastActivityTime = null
  activityIntervals = []
}

/**
 * Update last activity time
 */
const updateActivity = () => {
  if (!isAnalyticsEnabled() || !sessionStartTime) return
  
  const now = Date.now()
  
  // If gap is too large (> 5 minutes), consider it a break
  if (lastActivityTime && (now - lastActivityTime) > 5 * 60 * 1000) {
    // Save previous active period
    if (lastActivityTime > sessionStartTime) {
      activityIntervals.push({
        start: sessionStartTime,
        end: lastActivityTime
      })
    }
    sessionStartTime = now
  }
  
  lastActivityTime = now
}

/**
 * Handle page visibility changes
 */
const handleVisibilityChange = () => {
  if (!isAnalyticsEnabled() || !sessionStartTime) return
  
  if (document.hidden) {
    // Page hidden - save current active period
    if (lastActivityTime > sessionStartTime) {
      activityIntervals.push({
        start: sessionStartTime,
        end: lastActivityTime
      })
    }
  } else {
    // Page visible - start new period
    sessionStartTime = Date.now()
    lastActivityTime = Date.now()
  }
}

/**
 * Save session data
 */
const saveSessionData = () => {
  if (!isAnalyticsEnabled() || !sessionStartTime) return

  try {
    const now = Date.now()
    const finalEndTime = lastActivityTime || now
    
    // Add final interval if there's active time
    if (finalEndTime > sessionStartTime) {
      activityIntervals.push({
        start: sessionStartTime,
        end: finalEndTime
      })
    }
    
    // Calculate total active time
    const totalActiveTime = activityIntervals.reduce((sum, interval) => {
      return sum + (interval.end - interval.start)
    }, 0)
    
    const sessions = JSON.parse(localStorage.getItem(SESSION_DATA_KEY) || '[]')
    sessions.push({
      sessionId: getSessionId(),
      userId: getUserId(),
      startTime: new Date(sessionStartTime).toISOString(),
      endTime: new Date(finalEndTime).toISOString(),
      totalActiveTime: Math.round(totalActiveTime / 1000), // seconds
      activeIntervals: activityIntervals.length,
      timestamp: new Date().toISOString()
    })
    
    // Keep only last 100 sessions to avoid storage bloat
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100)
    }
    
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessions))
  } catch (e) {
    console.error('Failed to save session data', e)
  }
}

/**
 * Track retention (daily visit)
 */
export const trackRetention = () => {
  if (!isAnalyticsEnabled()) return

  try {
    const today = new Date().toDateString()
    const retention = JSON.parse(localStorage.getItem(RETENTION_DATA_KEY) || '[]')
    
    // Check if already tracked today
    const todayEntry = retention.find(entry => entry.date === today)
    if (!todayEntry) {
      retention.push({
        date: today,
        timestamp: new Date().toISOString(),
        userId: getUserId(),
        sessionId: getSessionId()
      })
      
      // Keep only last 365 days
      if (retention.length > 365) {
        retention.splice(0, retention.length - 365)
      }
      
      localStorage.setItem(RETENTION_DATA_KEY, JSON.stringify(retention))
    }
  } catch (e) {
    console.error('Failed to track retention', e)
  }
}

/**
 * Get analytics data for dashboard (aggregated, anonymized)
 */
export const getAnalyticsData = () => {
  if (!isAnalyticsEnabled()) {
    return {
      flaggedQuestions: [],
      dropOffs: [],
      sessionData: [],
      retentionData: []
    }
  }

  try {
    return {
      flaggedQuestions: JSON.parse(localStorage.getItem(FLAGGED_QUESTIONS_KEY) || '[]'),
      dropOffs: JSON.parse(localStorage.getItem(DROP_OFFS_KEY) || '[]'),
      sessionData: JSON.parse(localStorage.getItem(SESSION_DATA_KEY) || '[]'),
      retentionData: JSON.parse(localStorage.getItem(RETENTION_DATA_KEY) || '[]')
    }
  } catch (e) {
    console.error('Failed to get analytics data', e)
    return {
      flaggedQuestions: [],
      dropOffs: [],
      sessionData: [],
      retentionData: []
    }
  }
}
