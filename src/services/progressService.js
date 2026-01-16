/**
 * Clean Progress Service
 * Handles all user progress storage and retrieval
 * Simple: localStorage with user ID prefix, no caching, no migration
 */

import { getUserId } from './authService'

/**
 * Get the storage key prefix for current user
 * Returns 'user_${userId}_' if authenticated, 'guest_' if not
 */
const getStoragePrefix = async () => {
  const userId = await getUserId()
  const prefix = userId ? `user_${userId}_` : 'guest_'
  return prefix
}

/**
 * Get a progress key with user prefix
 */
const getProgressKey = async (key) => {
  const prefix = await getStoragePrefix()
  return `${prefix}${key}`
}

/**
 * Progress keys
 */
export const PROGRESS_KEYS = {
  completed: 'tsv2Completed',
  completedItems: 'tsv2CompletedItems',
  dailyQuests: (date) => `tsv2DailyQuests_${date}`,
  dailyQuestsDate: 'tsv2DailyQuestsDate',
  dailyXP: (date) => `tsv2DailyXP_${date}`,
  dailyLessons: (date) => `tsv2DailyLessons_${date}`,
  lessonCompletion: (index) => `tsv2LessonCompletion_${index}`,
  itemCompletion: (item) => `tsv2ItemCompletion_${item}`,
  reviewCompletion: (item) => `tsv2ReviewCompletion_${item}`,
  skipQuizCompletion: (item) => `tsv2SkipQuizCompletion_${item}`,
  lightMode: 'tsv2LightMode',
  userTimezone: 'tsv2UserTimezone',
  userStartDay: 'tsv2UserStartDay'
}

/**
 * Get progress item
 */
export const getProgress = async (key) => {
  const fullKey = await getProgressKey(key)
  const value = localStorage.getItem(fullKey)
  return value
}

/**
 * Set progress item
 */
export const setProgress = async (key, value) => {
  const fullKey = await getProgressKey(key)
  localStorage.setItem(fullKey, value)
  
  // Verify it was saved
  const saved = localStorage.getItem(fullKey)
  if (saved !== value) {
    console.error('[progressService] ERROR: Failed to save progress! Expected:', value, 'Got:', saved)
  }
}

/**
 * Remove progress item
 */
export const removeProgress = async (key) => {
  const fullKey = await getProgressKey(key)
  localStorage.removeItem(fullKey)
}

/**
 * Get completed lessons array
 */
export const getCompletedLessons = async () => {
  const stored = await getProgress(PROGRESS_KEYS.completed)
  
  // If no user-scoped data exists, check for old global key and migrate it
  if (!stored) {
    const oldKey = 'tsv2Completed'
    const oldData = localStorage.getItem(oldKey)
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData)
        // Migrate to user-scoped key
        await setProgress(PROGRESS_KEYS.completed, oldData)
        // Remove old key
        localStorage.removeItem(oldKey)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('[progressService] Error migrating old data:', e)
        return []
      }
    }
    return []
  }
  
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) 
      ? parsed.map(id => typeof id === 'string' ? parseInt(id, 10) : id).filter(id => !isNaN(id))
      : []
  } catch (e) {
    return []
  }
}

/**
 * Add completed lesson
 * Also marks the lesson as completed on today's date
 */
export const addCompletedLesson = async (lessonId) => {
  if (lessonId === null || lessonId === undefined) {
    console.error('[progressService] ERROR: lessonId is null/undefined!')
    return []
  }
  
  const lessonIdNum = typeof lessonId === 'string' ? parseInt(lessonId, 10) : lessonId
  
  if (isNaN(lessonIdNum)) {
    console.error('[progressService] ERROR: lessonId cannot be parsed as number! lessonId:', lessonId)
    return []
  }
  
  const completed = await getCompletedLessons()
  
  if (!completed.includes(lessonIdNum)) {
    completed.push(lessonIdNum)
    await setProgress(PROGRESS_KEYS.completed, JSON.stringify(completed))
    
    // Mark lesson as completed on today's date
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateKey = `${year}-${month}-${day}`
    await markLessonCompletedOnDate(lessonIdNum, dateKey)
  }
  
  return completed
}

/**
 * Get completed items array
 */
export const getCompletedItems = async () => {
  const stored = await getProgress(PROGRESS_KEYS.completedItems)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

/**
 * Add completed item
 */
export const addCompletedItem = async (item) => {
  const items = await getCompletedItems()
  if (!items.includes(item)) {
    items.push(item)
    await setProgress(PROGRESS_KEYS.completedItems, JSON.stringify(items))
  }
  return items
}

/**
 * Get daily XP for a date
 */
export const getDailyXP = async (date) => {
  const stored = await getProgress(PROGRESS_KEYS.dailyXP(date))
  return parseInt(stored || '0', 10)
}

/**
 * Add daily XP
 */
export const addDailyXP = async (date, xp) => {
  const current = await getDailyXP(date)
  const newTotal = current + xp
  await setProgress(PROGRESS_KEYS.dailyXP(date), String(newTotal))
  return newTotal
}

/**
 * Subtract daily XP (for revoking XP when lesson is quit early)
 */
export const subtractDailyXP = async (date, xp) => {
  const current = await getDailyXP(date)
  const newTotal = Math.max(0, current - xp) // Don't go below 0
  await setProgress(PROGRESS_KEYS.dailyXP(date), String(newTotal))
  return newTotal
}

/**
 * Get daily lesson count for a date
 */
export const getDailyLessonCount = async (date) => {
  const stored = await getProgress(PROGRESS_KEYS.dailyLessons(date))
  return stored === '1' ? 1 : 0
}

/**
 * Set daily lesson count for a date
 */
export const setDailyLessonCount = async (date, count) => {
  await setProgress(PROGRESS_KEYS.dailyLessons(date), count > 0 ? '1' : '0')
}

/**
 * Mark lesson as completed on a specific date
 */
export const markLessonCompletedOnDate = async (lessonId, date) => {
  await setProgress(PROGRESS_KEYS.lessonCompletion(lessonId), date)
}

/**
 * Get all progress keys for current user (for cleanup)
 */
export const getAllProgressKeys = async () => {
  const prefix = await getStoragePrefix()
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      keys.push(key)
    }
  }
  return keys
}
