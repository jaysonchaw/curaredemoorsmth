/**
 * Answer Tracker - Stores user answers (warned/wrong) for personalized practice
 * 
 * Uses Supabase for authenticated users, localStorage as fallback
 * 
 * Data structure:
 * {
 *   [lessonId]: {
 *     [questionIndex]: {
 *       result: 'warned' | 'wrong',
 *       questionPosition: 1-9, // 1-based position in lesson
 *       timestamp: number
 *     }
 *   }
 * }
 */

import { supabase } from '../services/authService'

const STORAGE_KEY = 'tsv2Answers'

/**
 * Get current user ID (if authenticated)
 */
const getUserId = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  } catch (e) {
    return null
  }
}

/**
 * Record an answer result for a question
 * @param {number} lessonId - The lesson ID (1-based)
 * @param {number} questionIndex - The question index (0-based)
 * @param {string} result - 'warned' or 'wrong'
 */
export const recordAnswer = async (lessonId, questionIndex, result) => {
  if (result !== 'warned' && result !== 'wrong') {
    return // Only track warned and wrong answers
  }

  const questionPosition = questionIndex + 1
  const userId = await getUserId()

  // If user is authenticated, save to Supabase
  if (userId) {
    try {
      // Check if record already exists
      const { data: existing } = await supabase
        .from('lesson_frequency')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .eq('question_index', questionIndex)
        .single()

      const frequencyData = {
        user_id: userId,
        lesson_id: lessonId,
        question_index: questionIndex,
        question_position: questionPosition,
        result: result,
        frequency: 1, // Count of times this question was answered incorrectly
        last_updated: new Date().toISOString()
      }

      if (existing) {
        // Update existing record - increment frequency
        await supabase
          .from('lesson_frequency')
          .update({
            result: result,
            frequency: (existing.frequency || 0) + 1,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        // Insert new record
        await supabase
          .from('lesson_frequency')
          .insert(frequencyData)
      }
    } catch (e) {
      console.error('Failed to save answer to Supabase', e)
      // Fallback to localStorage
      saveToLocalStorage(lessonId, questionIndex, result, questionPosition)
    }
  } else {
    // Not authenticated, use localStorage
    saveToLocalStorage(lessonId, questionIndex, result, questionPosition)
  }
}

/**
 * Save answer to localStorage (fallback)
 */
const saveToLocalStorage = (lessonId, questionIndex, result, questionPosition) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    let answers = {}
    if (stored) {
      answers = JSON.parse(stored)
    }

    if (!answers[lessonId]) {
      answers[lessonId] = {}
    }

    answers[lessonId][questionIndex] = {
      result,
      questionPosition,
      timestamp: Date.now()
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  } catch (e) {
    console.error('Failed to record answer to localStorage', e)
  }
}

/**
 * Get all answers for a specific lesson
 * @param {number} lessonId - The lesson ID
 * @returns {Object} Object mapping questionIndex to answer data
 */
export const getLessonAnswers = async (lessonId) => {
  const userId = await getUserId()

  // If user is authenticated, get from Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('lesson_frequency')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)

      if (error) throw error

      // Convert Supabase format to expected format
      const answers = {}
      if (data) {
        data.forEach(item => {
          answers[item.question_index] = {
            result: item.result,
            questionPosition: item.question_position,
            timestamp: new Date(item.last_updated).getTime()
          }
        })
      }
      return answers
    } catch (e) {
      console.error('Failed to get answers from Supabase', e)
      // Fallback to localStorage
      return getFromLocalStorage(lessonId)
    }
  } else {
    // Not authenticated, use localStorage
    return getFromLocalStorage(lessonId)
  }
}

/**
 * Get answers from localStorage (fallback)
 */
const getFromLocalStorage = (lessonId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    
    const answers = JSON.parse(stored)
    return answers[lessonId] || {}
  } catch (e) {
    console.error('Failed to get lesson answers from localStorage', e)
    return {}
  }
}

/**
 * Get all answers for multiple lessons
 * @param {number[]} lessonIds - Array of lesson IDs
 * @returns {Object} Object mapping lessonId to answer data
 */
export const getMultipleLessonAnswers = async (lessonIds) => {
  const userId = await getUserId()

  // If user is authenticated, get from Supabase
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('lesson_frequency')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)

      if (error) throw error

      // Convert Supabase format to expected format
      const result = {}
      if (data) {
        data.forEach(item => {
          if (!result[item.lesson_id]) {
            result[item.lesson_id] = {}
          }
          result[item.lesson_id][item.question_index] = {
            result: item.result,
            questionPosition: item.question_position,
            timestamp: new Date(item.last_updated).getTime()
          }
        })
      }
      return result
    } catch (e) {
      console.error('Failed to get multiple lesson answers from Supabase', e)
      // Fallback to localStorage
      return getMultipleFromLocalStorage(lessonIds)
    }
  } else {
    // Not authenticated, use localStorage
    return getMultipleFromLocalStorage(lessonIds)
  }
}

/**
 * Get multiple lessons from localStorage (fallback)
 */
const getMultipleFromLocalStorage = (lessonIds) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    
    const answers = JSON.parse(stored)
    const result = {}
    
    lessonIds.forEach(lessonId => {
      if (answers[lessonId]) {
        result[lessonId] = answers[lessonId]
      }
    })
    
    return result
  } catch (e) {
    console.error('Failed to get multiple lesson answers from localStorage', e)
    return {}
  }
}

/**
 * Clear all answer tracking data
 */
export const clearAllAnswers = async () => {
  const userId = await getUserId()

  if (userId) {
    try {
      await supabase
        .from('lesson_frequency')
        .delete()
        .eq('user_id', userId)
    } catch (e) {
      console.error('Failed to clear answers from Supabase', e)
    }
  }

  // Also clear localStorage
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear answers from localStorage', e)
  }
}

/**
 * Clear answers for a specific lesson
 * @param {number} lessonId - The lesson ID
 */
export const clearLessonAnswers = async (lessonId) => {
  const userId = await getUserId()

  if (userId) {
    try {
      await supabase
        .from('lesson_frequency')
        .delete()
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
    } catch (e) {
      console.error('Failed to clear lesson answers from Supabase', e)
    }
  }

  // Also clear from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    
    const answers = JSON.parse(stored)
    delete answers[lessonId]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  } catch (e) {
    console.error('Failed to clear lesson answers from localStorage', e)
  }
}
