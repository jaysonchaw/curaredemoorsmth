export const lesson13Questions = [
  {
    id: 1,
    type: 'illustratedMCQ',
    question: 'Which drink is mostly water?',
    options: [
      // IDs must match SVG name prefixes in /public for IllustratedMCQ
      { id: 'water', label: 'Water', correct: true },
      { id: 'soda', label: 'Soda', correct: false },
      { id: 'orangejuice', label: 'Orange Juice', correct: false }
    ],
    correctAnswer: 'water'
  },
  {
    id: 2,
    type: 'fillInTheBlank',
    question: 'Water carries nutrients and ___ to every cell.',
    correctAnswer: 'oxygen',
    placeholder: 'Type your answer here...'
  },
  {
    id: 3,
    type: 'mcq',
    question: 'Which is a sign of dehydration (low water)?',
    options: [
      { id: 'a', label: 'Dark yellow urine', correct: true },
      { id: 'b', label: 'Runny nose', correct: false },
      { id: 'c', label: 'Itchy eyes', correct: false },
      { id: 'd', label: 'Increased sweating', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 4,
    type: 'mcq',
    question: 'Which action helps the body cool down when hot?',
    options: [
      { id: 'a', label: 'Sweating', correct: true },
      { id: 'b', label: 'Shivering', correct: false },
      { id: 'c', label: 'Yawning', correct: false },
      { id: 'd', label: 'Smiling', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 5,
    type: 'fillInTheBlank',
    question: 'When you exercise, you lose water by ___.',
    correctAnswer: 'sweating',
    placeholder: 'Type your answer here...'
  },
  {
    id: 6,
    type: 'mcq',
    question: 'Which drink should you avoid drinking too much of?',
    options: [
      { id: 'a', label: 'Soda', correct: true },
      { id: 'b', label: 'Water', correct: false },
      { id: 'c', label: 'Milk', correct: false },
      { id: 'd', label: 'Juice', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 7,
    type: 'answerYourself',
    question: 'Describe why it’s important to drink extra water on a hot day or during exercise.',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention replacing water lost by sweat, preventing dehydration, maintaining body functions'
  },
  {
    id: 8,
    type: 'mcq',
    question: 'Which of these is a sign of dehydration?',
    options: [
      { id: 'a', label: 'Feeling very thirsty', correct: true },
      { id: 'b', label: 'Feeling full of energy', correct: false },
      { id: 'c', label: 'Pale urine', correct: false },
      { id: 'd', label: 'Moist lips', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 9,
    type: 'answerYourself',
    question: 'What might happen to your body if you don’t drink enough fluids during sports or play?',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention tiredness, muscle cramps, dizziness, inability to continue activity'
  }
]

export default lesson13Questions


