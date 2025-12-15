import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const PostTest = () => {
  const { userData } = useOutletContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  useEffect(() => {
    const fetchPostTest = async () => {
      if (!userData?.id) {
        setLoading(false)
        return
      }

      try {
        // Check if post-test is available
        const response = await fetch(`http://localhost:3001/api/post-test/availability?userId=${userData.id}`)
        const data = await response.json()
        
        if (!data.available) {
          // Redirect to results if not available
          navigate('/dashboard/results')
          return
        }

        // Fetch post-test questions
        const questionsResponse = await fetch(`http://localhost:3001/api/post-test/questions?userId=${userData.id}`)
        const questionsData = await questionsResponse.json()
        
        if (questionsData.questions) {
          setQuestions(questionsData.questions)
        }
      } catch (error) {
        console.error('Error fetching post-test:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPostTest()
  }, [userData, navigate])

  const handleAnswer = (questionId, answer) => {
    if (submitted) return
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (submitted) return

    // Calculate score
    let correctCount = 0
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const calculatedScore = Math.round((correctCount / questions.length) * 100)
    setScore(calculatedScore)
    setSubmitted(true)

    // Save score to database
    try {
      const { error } = await supabase
        .from('quiz_scores')
        .insert({
          user_id: userData.id,
          test_type: 'post',
          score: calculatedScore,
          taken_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving post-test score:', error)
      }
    } catch (error) {
      console.error('Error saving post-test score:', error)
    }
  }

  const handleBackToResults = () => {
    navigate('/dashboard/results')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading post-test...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post-Test</h1>
          <p className="text-gray-600">No questions available at this time.</p>
          <button
            onClick={handleBackToResults}
            className="mt-4 px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined)

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post-Test</h1>
        <p className="text-gray-600">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {submitted && score !== null ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Complete!</h2>
          <div className="text-4xl font-bold text-curare-blue mb-6">{score}%</div>
          <p className="text-gray-600 mb-6">
            You answered {questions.filter(q => answers[q.id] === q.correctAnswer).length} out of {questions.length} questions correctly.
          </p>
          <button
            onClick={handleBackToResults}
            className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Results
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion?.question || 'Question'}
          </h2>

          <div className="space-y-4">
            {currentQuestion?.options?.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-curare-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={() => handleAnswer(currentQuestion.id, option.value)}
                  className="mr-4"
                />
                <span className="text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostTest


