/**
 * Personalized Practice Algorithm
 * 
 * Calculates question scores based on:
 * - Warned (Questions 1-3): 1 Point
 * - Wrong (Questions 1-3): 2 Points
 * - Warned (Questions 4-6): 0.6 Points
 * - Wrong (Questions 4-6): 1.2 Points
 * - Warned (Questions 7-9): 0.3 Points
 * - Wrong (Questions 7-9): 0.6 Points
 */

import { getMultipleLessonAnswers } from './answerTracker'
import { getLessonQuestions } from '../data/lessons/lessonLoader'

/**
 * Calculate score for a question based on its position and result
 * @param {number} questionPosition - 1-based position (1-9)
 * @param {string} result - 'warned' or 'wrong'
 * @returns {number} Score for the question
 */
export const calculateQuestionScore = (questionPosition, result) => {
  if (questionPosition >= 1 && questionPosition <= 3) {
    return result === 'warned' ? 1 : 2
  } else if (questionPosition >= 4 && questionPosition <= 6) {
    return result === 'warned' ? 0.6 : 1.2
  } else if (questionPosition >= 7 && questionPosition <= 9) {
    return result === 'warned' ? 0.3 : 0.6
  }
  return 0
}

/**
 * Get the two lessons before a personalized practice
 * @param {number} practiceIndex - The index of the personalized practice in lessonNames array
 * @param {Array} lessonNames - Array of all lesson names
 * @returns {Array} Array of lesson IDs (1-based) that come before this practice
 */
export const getPreviousLessons = (practiceIndex, lessonNames) => {
  const lessons = []
  
  // Go backwards from the practice index to find the two previous lessons
  for (let i = practiceIndex - 1; i >= 0 && lessons.length < 2; i--) {
    const name = lessonNames[i]
    // Skip other personalized practices and reviews
    if (name !== 'Personalized Practice' && name !== 'Review') {
      // Calculate the actual lesson ID by counting only lessons
      let lessonCount = 0
      for (let j = 0; j <= i; j++) {
        const itemName = lessonNames[j]
        if (itemName !== 'Personalized Practice' && itemName !== 'Review') {
          lessonCount++
        }
      }
      lessons.unshift(lessonCount) // Add to beginning to maintain order
    }
  }
  
  return lessons
}

/**
 * Check if a lesson is completed
 * @param {number} lessonId - The lesson ID
 * @returns {boolean} True if lesson is completed
 */
const isLessonCompleted = (lessonId) => {
  try {
    // Check localStorage for completed lessons
    const stored = localStorage.getItem('tsv2Completed')
    if (stored) {
      const completed = JSON.parse(stored)
      if (Array.isArray(completed) && completed.includes(lessonId)) {
        return true
      }
    }
    return false
  } catch (e) {
    return false
  }
}

/**
 * Build a weighted pool of questions from previous lessons
 * @param {Array} lessonIds - Array of lesson IDs to pull questions from
 * @returns {Promise<Array>} Array of question objects with scores: { lessonId, questionIndex, question, score }
 */
export const buildQuestionPool = async (lessonIds) => {
  const allAnswers = await getMultipleLessonAnswers(lessonIds)
  const questionPool = []
  
  lessonIds.forEach(lessonId => {
    const lessonAnswers = allAnswers[lessonId] || {}
    const questions = getLessonQuestions(lessonId)
    const lessonCompleted = isLessonCompleted(lessonId)
    
    // If lesson is completed but has no wrong/warned answers, include all questions with low score
    // Otherwise, only include questions with wrong/warned answers
    questions.forEach((question, questionIndex) => {
      const answerData = lessonAnswers[questionIndex]
      
      if (answerData) {
        // Question was answered incorrectly (warned or wrong)
        const score = calculateQuestionScore(
          answerData.questionPosition,
          answerData.result
        )
        questionPool.push({
          lessonId,
          questionIndex,
          question,
          score,
          questionPosition: answerData.questionPosition
        })
      } else if (lessonCompleted) {
        // Lesson is completed but this question wasn't answered incorrectly
        // Include it with a low score (0.1) so it can still be selected if needed
        questionPool.push({
          lessonId,
          questionIndex,
          question,
          score: 0.1,
          questionPosition: questionIndex + 1
        })
      }
    })
  })
  
  return questionPool
}

/**
 * Select questions using weighted random selection
 * @param {Array} questionPool - Pool of questions with scores
 * @param {number} count - Number of questions to select
 * @returns {Array} Selected questions
 */
export const selectWeightedQuestions = (questionPool, count) => {
  if (questionPool.length === 0) {
    return []
  }
  
  // Calculate total score
  const totalScore = questionPool.reduce((sum, q) => sum + q.score, 0)
  
  if (totalScore === 0) {
    // If no scores, return random questions
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }
  
  // Weighted selection
  const selected = []
  const used = new Set()
  
  for (let i = 0; i < count && selected.length < questionPool.length; i++) {
    // Create a random threshold
    let random = Math.random() * totalScore
    let cumulative = 0
    
    for (const question of questionPool) {
      if (used.has(`${question.lessonId}-${question.questionIndex}`)) {
        continue
      }
      
      cumulative += question.score
      if (random <= cumulative) {
        selected.push(question)
        used.add(`${question.lessonId}-${question.questionIndex}`)
        break
      }
    }
    
    // Fallback if no question was selected (shouldn't happen, but safety)
    if (selected.length === i) {
      const available = questionPool.filter(
        q => !used.has(`${q.lessonId}-${q.questionIndex}`)
      )
      if (available.length > 0) {
        const randomQ = available[Math.floor(Math.random() * available.length)]
        selected.push(randomQ)
        used.add(`${randomQ.lessonId}-${randomQ.questionIndex}`)
      }
    }
  }
  
  return selected
}

/**
 * Get questions for a personalized practice
 * @param {number} practiceIndex - Index of the practice in lessonNames array
 * @param {Array} lessonNames - Array of all lesson names
 * @param {number} initialCount - Initial number of questions (default 5)
 * @returns {Promise<Array>} Array of question objects for the practice
 */
export const getPersonalizedPracticeQuestions = async (practiceIndex, lessonNames, initialCount = 5) => {
  // Get the two previous lessons
  const previousLessonIds = getPreviousLessons(practiceIndex, lessonNames)
  
  if (previousLessonIds.length === 0) {
    // No previous lessons, return empty array
    return []
  }
  
  // Build question pool from previous lessons
  const questionPool = await buildQuestionPool(previousLessonIds)
  
  if (questionPool.length === 0) {
    // No questions with wrong/warned answers, return empty array
    return []
  }
  
  // Select questions using weighted selection
  const selected = selectWeightedQuestions(questionPool, initialCount)
  
  return selected
}

