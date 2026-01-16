export const review1Questions = [
  {
    id: 1,
    type: 'mcq',
    question: 'Which body system does the heart belong to?',
    options: [
      { id: 'a', label: 'Skeletal System', correct: false },
      { id: 'b', label: 'Muscular System', correct: false },
      { id: 'c', label: 'Circulatory System', correct: true },
      { id: 'd', label: 'Digestive System', correct: false }
    ],
    correctAnswer: 'c'
  },
  {
    id: 2,
    type: 'fillInTheBlank',
    question: 'Every tissue and organ in your body is made of many _____.',
    correctAnswer: 'cells',
    placeholder: 'Type your answer here...'
  },
  {
    id: 3,
    type: 'mcq',
    question: 'What are the tiny structures (referred to as the building blocks of life) called?',
    options: [
      { id: 'a', label: 'Organs', correct: false },
      { id: 'b', label: 'Tissues', correct: false },
      { id: 'c', label: 'Cells', correct: true },
      { id: 'd', label: 'Systems', correct: false }
    ],
    correctAnswer: 'c'
  },
  {
    id: 4,
    type: 'fillInTheBlank',
    question: 'A tissue is a group of similar _____ working together to do a job.',
    correctAnswer: 'cells',
    placeholder: 'Type your answer here...'
  },
  {
    id: 5,
    type: 'illustratedMCQ',
    question: 'Which of these organs belongs to the nervous system?',
    options: [
      { id: 'heart', label: 'Heart', correct: false },
      { id: 'leaf', label: 'Leaf', correct: false },
      { id: 'brain', label: 'Brain', correct: true }
    ],
    correctAnswer: 'brain'
  },
  {
    id: 6,
    type: 'mcq',
    question: 'Which of the following is true about body organization?',
    options: [
      { id: 'a', label: 'Organs are made of similar cells only.', correct: false },
      { id: 'b', label: 'Cells combine to form tissues.', correct: true },
      { id: 'c', label: 'Systems are made up of tissues only.', correct: false },
      { id: 'd', label: 'Tissues form systems directly without organs.', correct: false }
    ],
    correctAnswer: 'b'
  },
  {
    id: 7,
    type: 'fillInTheBlank',
    question: 'An organ is made of two or more different types of _____.',
    correctAnswer: 'tissues',
    placeholder: 'Type your answer here...'
  },
  {
    id: 8,
    type: 'mcq',
    question: 'Which organ contains muscle tissue, nerve tissue, and blood vessel tissue?',
    options: [
      { id: 'a', label: 'Lung', correct: false },
      { id: 'b', label: 'Stomach', correct: false },
      { id: 'c', label: 'Heart', correct: true },
      { id: 'd', label: 'Skin', correct: false }
    ],
    correctAnswer: 'c'
  },
  {
    id: 9,
    type: 'mcq',
    question: 'What is the correct order of body organization from smallest to largest?',
    options: [
      { id: 'a', label: 'Cells → Organs → Tissues → Systems', correct: false },
      { id: 'b', label: 'Systems → Organs → Tissues → Cells', correct: false },
      { id: 'c', label: 'Cells → Tissues → Organs → Systems', correct: true },
      { id: 'd', label: 'Tissues → Cells → Organs → Systems', correct: false }
    ],
    correctAnswer: 'c'
  },
  {
    id: 10,
    type: 'fillInTheBlank',
    question: 'Cells form tissues, tissues form organs, and organs form _____.',
    correctAnswer: 'systems',
    placeholder: 'Type your answer here...'
  },
  {
    id: 11,
    type: 'answerYourself',
    question: 'Why is it important for different body systems (like respiratory and circulatory) to work together?',
    placeholder: 'Type your answer here...',
    gradingNotes: 'should mention that systems need to work together to keep the body functioning, e.g., respiratory system provides oxygen, circulatory system delivers it to cells'
  },
  {
    id: 12,
    type: 'mcq',
    question: 'If the heart stopped pumping blood, which system would immediately be affected?',
    options: [
      { id: 'a', label: 'Skeletal System', correct: false },
      { id: 'b', label: 'Muscular System', correct: false },
      { id: 'c', label: 'Nervous System', correct: false },
      { id: 'd', label: 'Circulatory System', correct: true }
    ],
    correctAnswer: 'd'
  },
  {
    id: 13,
    type: 'mcq',
    question: 'Which of these organs is part of the nervous system?',
    options: [
      { id: 'a', label: 'Heart', correct: false },
      { id: 'b', label: 'Stomach', correct: false },
      { id: 'c', label: 'Brain', correct: true },
      { id: 'd', label: 'Liver', correct: false }
    ],
    correctAnswer: 'c'
  },
  {
    id: 14,
    type: 'mcq',
    question: 'Which pair of body parts shows systems working together during exercise?',
    options: [
      { id: 'a', label: 'Brain and Spinal Cord', correct: false },
      { id: 'b', label: 'Lungs and Heart', correct: true },
      { id: 'c', label: 'Skin and Hair', correct: false },
      { id: 'd', label: 'Bones and Teeth', correct: false }
    ],
    correctAnswer: 'b'
  },
  {
    id: 15,
    type: 'answerYourself',
    question: 'Name two body systems and describe one way they work together to help you move or stay healthy.',
    placeholder: 'Type your answer here...',
    gradingNotes: 'should name two systems and explain how they work together, e.g., skeletal and muscular systems work together for movement'
  }
]

export default review1Questions
