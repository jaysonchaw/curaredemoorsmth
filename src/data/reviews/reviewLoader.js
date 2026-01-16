// Review loader - dynamically imports review data
// This makes reviews reproducible - just add review files following the pattern

import { review1Questions } from './review1'
import { review2Questions } from './review2'
import { review3Questions } from './review3'
import { review4Questions } from './review4'
import { review5Questions } from './review5'
import { review6Questions } from './review6'

// Review data map - add new reviews here as they're created
const reviewDataMap = {
  1: review1Questions,
  2: review2Questions,
  3: review3Questions,
  4: review4Questions,
  5: review5Questions,
  6: review6Questions
}

/**
 * Get questions for a specific review
 * @param {number} reviewId - The review ID (1-6)
 * @returns {Array} Array of question objects
 */
export const getReviewQuestions = (reviewId) => {
  const questions = reviewDataMap[reviewId]
  if (!questions) {
    console.warn(`Review ${reviewId} not found. Returning empty array.`)
    return []
  }
  return questions
}

/**
 * Check if a review exists
 * @param {number} reviewId - The review ID
 * @returns {boolean} True if review exists
 */
export const reviewExists = (reviewId) => {
  return reviewId in reviewDataMap
}

export default {
  getReviewQuestions,
  reviewExists
}
