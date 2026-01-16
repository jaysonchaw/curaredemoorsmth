/**
 * Lesson Practice Algorithm
 * 
 * Creates a 6-question practice session from a single lesson:
 * - Mostly randomized questions from the original lesson
 * - Medium frequency/weight for questions they got wrong/warned
 */

import { getLessonAnswers } from './answerTracker'
import { getLessonQuestions } from '../data/lessons/lessonLoader'

/**
 * Get practice questions for a specific lesson
 * @param {number} lessonId - The lesson ID
 * @param {number} count - Number of questions to select (default 6)
 * @returns {Promise<Array>} Array of question objects for practice
 */
export const getLessonPracticeQuestions = async (lessonId, count = 6) => {
  const questions = getLessonQuestions(lessonId)
  
  if (questions.length === 0) {
    return []
  }
  
  // Get wrong/warned answers for this lesson
  const lessonAnswers = await getLessonAnswers(lessonId)
  
  // Build question pool with weights
  const questionPool = questions.map((question, questionIndex) => {
    const answerData = lessonAnswers[questionIndex]
    const questionPosition = questionIndex + 1
    
    // Base weight for all questions (for randomization)
    let weight = 1
    
    // Medium frequency boost for wrong/warned questions
    if (answerData) {
      // Give medium weight (2-3x) to questions they got wrong/warned
      if (answerData.result === 'wrong') {
        weight = 3 // Higher weight for wrong answers
      } else if (answerData.result === 'warned') {
        weight = 2 // Medium weight for warned answers
      }
    }
    
    return {
      lessonId,
      questionIndex,
      question,
      weight,
      questionPosition,
      wasIncorrect: !!answerData
    }
  })
  
  // Select questions using weighted random selection
  const selected = selectWeightedQuestions(questionPool, count)
  
  return selected
}

/**
 * Select questions using weighted random selection
 * @param {Array} questionPool - Pool of questions with weights
 * @param {number} count - Number of questions to select
 * @returns {Array} Selected questions
 */
const selectWeightedQuestions = (questionPool, count) => {
  if (questionPool.length === 0) {
    return []
  }
  
  // Calculate total weight
  const totalWeight = questionPool.reduce((sum, q) => sum + q.weight, 0)
  
  if (totalWeight === 0) {
    // If no weights, return random questions
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }
  
  // Weighted selection
  const selected = []
  const used = new Set()
  
  for (let i = 0; i < count && selected.length < questionPool.length; i++) {
    // Create a random threshold
    let random = Math.random() * totalWeight
    let cumulative = 0
    
    for (const question of questionPool) {
      if (used.has(`${question.lessonId}-${question.questionIndex}`)) {
        continue
      }
      
      cumulative += question.weight
      if (random <= cumulative) {
        selected.push(question)
        used.add(`${question.lessonId}-${question.questionIndex}`)
        break
      }
    }
    
    // Fallback if no question was selected
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

