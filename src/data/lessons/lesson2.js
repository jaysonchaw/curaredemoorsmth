export const lesson2Questions = [
  {
    id: 1,
    type: 'illustratedMCQ',
    question: 'Which tool do we need to see cells?',
    options: [
      { id: 'microscope', label: 'Microscope', image: 'microscope.png', correct: true },
      { id: 'magnifyingglass', label: 'Magnifying Glass', image: 'magnifying-glass.png', correct: false },
      { id: 'telescope', label: 'Telescope', image: 'telescope.png', correct: false }
    ],
    correctAnswer: 'microscope'
  },
  {
    id: 2,
    type: 'fillInTheBlank',
    question: 'Cells can ___ to make new cells.',
    correctAnswer: 'divide',
    placeholder: 'Type your answer here...'
  },
  {
    id: 3,
    type: 'illustratedMCQ',
    question: 'Which of these is composed of living cells?',
    options: [
      { id: 'leaf', label: 'Leaf', image: 'leaf.png', correct: true },
      { id: 'rock', label: 'Rock', image: 'rock.png', correct: false },
      { id: 'plasticbottle', label: 'Plastic Bottle', image: 'bottle.png', correct: false }
    ],
    correctAnswer: 'leaf'
  },
  {
    id: 4,
    type: 'mcq',
    question: 'What term describes a group of similar cells working together?',
    options: [
      { id: 'a', label: 'Tissue', correct: true },
      { id: 'b', label: 'Organ', correct: false },
      { id: 'c', label: 'Organism', correct: false },
      { id: 'd', label: 'Organelle', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 5,
    type: 'fillInTheBlank',
    question: 'Different tissues working together form an ___.',
    correctAnswer: 'organ',
    placeholder: 'Type your answer here...'
  },
  {
    id: 6,
    type: 'mcq',
    question: 'What would happen if muscle cells could not divide?',
    options: [
      { id: 'a', label: 'Muscles could not grow or heal properly', correct: true },
      { id: 'b', label: 'Bones would stop growing', correct: false },
      { id: 'c', label: 'Cells would become larger instead', correct: false },
      { id: 'd', label: 'Organs would cease functioning', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 7,
    type: 'answerYourself',
    question: 'Explain why cells are often called "the building blocks of life."',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention that cells combine to form tissues and organs, forming all body structures'
  },
  {
    id: 8,
    type: 'mcq',
    question: 'Which statement is true about cells?',
    options: [
      { id: 'a', label: 'The human body contains trillions of cells', correct: true },
      { id: 'b', label: 'Only plants have cells', correct: false },
      { id: 'c', label: 'Cells are visible without a microscope', correct: false },
      { id: 'd', label: 'Cells cannot reproduce', correct: false }
    ],
    correctAnswer: 'a'
  },
  {
    id: 9,
    type: 'answerYourself',
    question: 'What might happen if your body\'s cells stopped dividing?',
    placeholder: 'Type your answer here...',
    gradingNotes: 'mention inability to grow, heal injuries, and replacement of old cells, causing issues like slower growth or poor wound healing'
  }
]

export default lesson2Questions

