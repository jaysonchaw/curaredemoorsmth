// Lesson loader - dynamically imports lesson data
// This makes lessons reproducible - just add lesson files following the pattern

import { lesson1Questions } from './lesson1'
import { lesson2Questions } from './lesson2'
import { lesson3Questions } from './lesson3'
import { lesson4Questions } from './lesson4'
import { lesson5Questions } from './lesson5'
import { lesson6Questions } from './lesson6'
import { lesson8Questions } from './lesson8'
import { lesson9Questions } from './lesson9'
import { lesson10Questions } from './lesson10'
import { lesson11Questions } from './lesson11'
import { lesson12Questions } from './lesson12'
import { lesson13Questions } from './lesson13'
import { lesson14Questions } from './lesson14'
import { lesson15Questions } from './lesson15'
import { lesson16Questions } from './lesson16'
import { lesson17Questions } from './lesson17'
import { lesson18Questions } from './lesson18'
import { lesson19Questions } from './lesson19'
import { lesson20Questions } from './lesson20'
import { lesson21Questions } from './lesson21'
import { lesson22Questions } from './lesson22'
import { lesson23Questions } from './lesson23'
import { lesson24Questions } from './lesson24'
import { lesson25Questions } from './lesson25'
import { lesson26Questions } from './lesson26'
import { lesson27Questions } from './lesson27'
import { lesson28Questions } from './lesson28'

// Lesson data map - add new lessons here as they're created
const lessonDataMap = {
  1: lesson1Questions,
  2: lesson2Questions,
  3: lesson3Questions,
  4: lesson4Questions,
  5: lesson5Questions,
  6: lesson6Questions,
  8: lesson8Questions,
  9: lesson9Questions,
  10: lesson10Questions,
  11: lesson11Questions,
  12: lesson12Questions,
  13: lesson13Questions,
  14: lesson14Questions,
  15: lesson15Questions,
  16: lesson16Questions,
  17: lesson17Questions,
  18: lesson18Questions,
  19: lesson19Questions,
  20: lesson20Questions,
  21: lesson21Questions,
  22: lesson22Questions,
  23: lesson23Questions,
  24: lesson24Questions,
  25: lesson25Questions,
  26: lesson26Questions,
  27: lesson27Questions,
  28: lesson28Questions
  // Example:
  // 3: lesson3Questions,
  // etc.
}

/**
 * Get questions for a specific lesson
 * @param {number} lessonId - The lesson ID (1-28)
 * @returns {Array} Array of question objects
 */
export const getLessonQuestions = (lessonId) => {
  const questions = lessonDataMap[lessonId]
  if (!questions) {
    console.warn(`Lesson ${lessonId} not found. Returning empty array.`)
    return []
  }
  return questions
}

/**
 * Check if a lesson exists
 * @param {number} lessonId - The lesson ID
 * @returns {boolean} True if lesson exists
 */
export const lessonExists = (lessonId) => {
  return lessonId in lessonDataMap
}

/**
 * Get lesson metadata
 * @param {number} lessonId - The lesson ID
 * @returns {Object|null} Lesson metadata or null if not found
 */
export const getLessonMetadata = (lessonId) => {
  const lessons = [
    { id: 1, title: 'Human Body Systems' },
    { id: 2, title: 'Cells' },
    { id: 3, title: 'Tissues and Organs' },
    { id: 4, title: 'Skeletal System' },
    { id: 5, title: 'Muscular System' },
    { id: 6, title: 'Nervous System' },
    { id: 7, title: 'Circulatory System' },
    { id: 8, title: 'Respiratory System' },
    { id: 9, title: 'Digestive System' },
    { id: 10, title: 'Five Senses' },
    { id: 11, title: 'Skin' },
    { id: 12, title: 'Nutrition' },
    { id: 13, title: 'Water and Hydration' },
    { id: 14, title: 'Exercise and Fitness' },
    { id: 15, title: 'Sleep and Growth' },
    { id: 16, title: 'Immune System' },
    { id: 17, title: 'Germs' },
    { id: 18, title: 'Vaccines and Antibiotics' },
    { id: 19, title: 'Oral Health' },
    { id: 20, title: 'Puberty and Reproduction' },
    { id: 21, title: 'DNA and Heredity' },
    { id: 22, title: 'Endocrine System' },
    { id: 23, title: 'Hygiene' },
    { id: 24, title: 'Allergies' },
    { id: 25, title: 'Asthma' },
    { id: 26, title: 'Cancer' },
    { id: 27, title: 'Organ Transplants' },
    { id: 28, title: 'Medical Imaging' }
  ]
  
  return lessons.find(lesson => lesson.id === lessonId) || null
}

export default {
  getLessonQuestions,
  lessonExists,
  getLessonMetadata
}

