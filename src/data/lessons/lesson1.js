export const lesson1Questions = [
  {
    id: 1,
    type: 'illustratedMCQ',
    question: 'Which of these is part of the skeletal system?',
    options: [
      { id: 'bone', label: 'Bone', image: 'bone.png', correct: true },
      { id: 'muscle', label: 'Muscle', image: 'muscle.png', correct: false },
      { id: 'heart', label: 'Heart', image: 'heart.png', correct: false }
    ],
    correctAnswer: 'bone'
  },
  {
    id: 2,
    type: 'fillInTheBlank',
    question: 'Bones and ___ work together so we can stand and walk.',
    correctAnswer: 'muscles',
    placeholder: 'Type your answer here...'
  },
  {
    id: 3,
    type: 'illustratedMCQ',
    question: 'Which organ is part of the respiratory system?',
    options: [
      { id: 'lungs', label: 'Lungs', image: 'lungs.png', correct: true },
      { id: 'heart', label: 'Heart', image: 'heart.png', correct: false },
      { id: 'brain', label: 'Brain', image: 'brain.png', correct: false }
    ],
    correctAnswer: 'lungs'
  },
  {
    id: 4,
    type: 'mcq',
    question: 'Which system carries oxygen to the body\'s cells?',
    options: [
      { id: 'a', label: 'Muscular', correct: false },
      { id: 'b', label: 'Circulatory', correct: true },
      { id: 'c', label: 'Nervous', correct: false },
      { id: 'd', label: 'Digestive', correct: false }
    ],
    correctAnswer: 'b'
  },
  {
    id: 5,
    type: 'fillInTheBlank',
    question: 'The circulatory system carries oxygen to cells, while the _______ system removes carbon dioxide.',
    correctAnswer: 'respiratory',
    placeholder: 'Type your answer here...'
  },
  {
    id: 6,
    type: 'mcq',
    question: 'Which of the following sets of body parts work together to pick up and throw a ball?',
    options: [
      { id: 'a', label: 'Brain, muscles, bones', correct: true },
      { id: 'b', label: 'Stomach, liver, kidney', correct: false },
      { id: 'c', label: 'Skin, heart, lungs', correct: false },
      { id: 'd', label: 'Ear, hair, tongue', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 7,
    type: 'answerYourself',
    question: 'Explain how your brain, nerves, muscles, and bones work together when you pick up an object (like a book).',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention brain sends signals via nerves, muscles contract, bones provide support and movement'
  },
  {
    id: 8,
    type: 'mcq',
    question: 'Which activity involves both your skeletal and muscular systems?',
    options: [
      { id: 'a', label: 'Jumping', correct: true },
      { id: 'b', label: 'Watching TV', correct: false },
      { id: 'c', label: 'Eating', correct: false },
      { id: 'd', label: 'Sweating', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 9,
    type: 'answerYourself',
    question: 'Explain one way in which two different body systems (such as circulatory & respiratory or nervous & muscular) work together during an activity or to keep you alive.',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention the systems involved and their roles (e.g., lungs oxygenate blood, heart pumps blood)'
  }
]

export default lesson1Questions
