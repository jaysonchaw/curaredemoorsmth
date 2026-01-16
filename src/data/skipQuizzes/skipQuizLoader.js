// Skip quiz loader - dynamically imports skip quiz data
// These quizzes allow users to skip to later units if they pass

import { skipQuiz2Questions } from './skipQuiz2'
import { skipQuiz3Questions } from './skipQuiz3'
import { skipQuiz4Questions } from './skipQuiz4'
import { skipQuiz5Questions } from './skipQuiz5'
import { skipQuiz6Questions } from './skipQuiz6'

// Skip quiz data map - add new skip quizzes here as they're created
const skipQuizDataMap = {
  2: skipQuiz2Questions,
  3: skipQuiz3Questions,
  4: skipQuiz4Questions,
  5: skipQuiz5Questions,
  6: skipQuiz6Questions
}

/**
 * Get questions for a specific skip quiz
 * @param {number} unitId - The unit ID (2-6)
 * @returns {Array} Array of question objects
 */
export const getSkipQuizQuestions = (unitId) => {
  const questions = skipQuizDataMap[unitId]
  if (!questions) {
    console.warn(`Skip quiz for unit ${unitId} not found. Returning empty array.`)
    return []
  }
  return questions
}

/**
 * Check if a skip quiz exists
 * @param {number} unitId - The unit ID
 * @returns {boolean} True if skip quiz exists
 */
export const skipQuizExists = (unitId) => {
  return unitId in skipQuizDataMap
}

export default {
  getSkipQuizQuestions,
  skipQuizExists
}

