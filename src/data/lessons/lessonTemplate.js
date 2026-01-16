/**
 * LESSON TEMPLATE
 * 
 * To add a new lesson:
 * 1. Copy this file and rename it to lessonX.js (where X is the lesson number)
 * 2. Replace the example questions with your actual questions
 * 3. Export the questions array as `lessonXQuestions`
 * 4. Import and add it to lessonLoader.js in the lessonDataMap
 * 
 * Question Types:
 * - 'mcq': Multiple choice with text options
 * - 'illustratedMCQ': Multiple choice with image options
 * - 'fillInTheBlank': Fill in the blank question
 * - 'answerYourself': Open-ended answer question
 */

export const lessonXQuestions = [
  // Example MCQ question
  {
    id: 1,
    type: 'mcq',
    question: 'What is the question text?',
    options: [
      { id: 'a', label: 'Option A', correct: false },
      { id: 'b', label: 'Option B', correct: true },
      { id: 'c', label: 'Option C', correct: false },
      { id: 'd', label: 'Option D', correct: false }
    ],
    correctAnswer: 'b'
  },
  
  // Example Illustrated MCQ question
  {
    id: 2,
    type: 'illustratedMCQ',
    question: 'Which of these is correct?',
    options: [
      { id: 'option1', label: 'Label 1', image: 'image1.png', correct: true },
      { id: 'option2', label: 'Label 2', image: 'image2.png', correct: false },
      { id: 'option3', label: 'Label 3', image: 'image3.png', correct: false }
    ],
    correctAnswer: 'option1'
  },
  
  // Example Fill in the Blank question
  {
    id: 3,
    type: 'fillInTheBlank',
    question: 'The answer is _______.',
    correctAnswer: 'correct answer',
    placeholder: 'Type your answer here...'
  },
  
  // Example Answer Yourself question
  {
    id: 4,
    type: 'answerYourself',
    question: 'Explain your answer in detail.',
    placeholder: 'Type your answer here...',
    gradingNotes: 'Look for key concepts: concept1, concept2, concept3'
  }
]

export default lessonXQuestions

