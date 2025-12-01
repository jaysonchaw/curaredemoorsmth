import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const PostTest = () => {
  const { userData } = useOutletContext()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Check availability first
        const availabilityResponse = await fetch(`http://localhost:3001/api/post-test/availability?userId=${userData?.id}`)
        const availabilityData = await availabilityResponse.json()
        
        if (!availabilityData.available) {
          setError(availabilityData.reason || 'Post-test is not available yet')
          setLoading(false)
          return
        }

        // Fetch post-test questions
        const { data, error: fetchError } = await supabase
          .from('post_test_questions')
          .select('*')
          .order('question_number', { ascending: true })

        if (fetchError) {
          setError('Failed to load post-test questions')
          console.error('Error fetching questions:', fetchError)
        } else if (!data || data.length === 0) {
          setError('No post-test questions found')
        } else {
          setQuestions(data)
          // Initialize answers object
          const initialAnswers = {}
          data.forEach(q => {
            initialAnswers[q.question_number] = ''
          })
          setAnswers(initialAnswers)
        }
      } catch (err) {
        setError('Network error loading post-test')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userData?.id) {
      fetchQuestions()
    }
  }, [userData])

  const handleAnswerChange = (questionNumber, value) => {
    setAnswers({ ...answers, [questionNumber]: value })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    questions.forEach(question => {
      totalPoints += question.points || 1
      const userAnswer = answers[question.question_number] || ''
      
      if (question.question_type === 'multiple_choice') {
        if (userAnswer === question.correct_answer) {
          earnedPoints += question.points || 1
        }
      } else if (question.question_type === 'fill_in_blank') {
        if (userAnswer.trim().toLowerCase() === question.correct_answer.toLowerCase()) {
          earnedPoints += question.points || 1
        }
      } else if (question.question_type === 'text_answer') {
        // For text answers, use rubric scoring if available
        const rubric = question.rubric || {}
        const answerLower = userAnswer.trim().toLowerCase()
        const correctLower = (question.correct_answer || '').toLowerCase()
        
        if (answerLower === correctLower || answerLower.includes(correctLower) || correctLower.includes(answerLower)) {
          earnedPoints += question.points || 2
        } else if (rubric.borderline_acceptable && answerLower.includes(rubric.borderline_acceptable.toLowerCase())) {
          earnedPoints += (question.points || 2) * 0.5
        }
      }
    })

    return { earned: earnedPoints, total: totalPoints, percentage: Math.round((earnedPoints / totalPoints) * 100) }
  }

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.question_number] || answers[q.question_number].trim() === '')
    
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`)) {
        return
      }
    }

    const scoreResult = calculateScore()
    setScore(scoreResult)
    setSubmitted(true)

    try {
      // Save score to database
      const { data: { session } } = await supabase.auth.getSession()
      if (session && userData) {
        // Check if score already exists
        const { data: existingScore } = await supabase
          .from('quiz_scores')
          .select('id')
          .eq('user_id', userData.id)
          .eq('test_type', 'post')
          .single()

        if (existingScore) {
          // Update existing score
          await supabase
            .from('quiz_scores')
            .update({
              score: scoreResult.percentage,
              points_earned: scoreResult.earned,
              points_total: scoreResult.total,
              taken_at: new Date().toISOString()
            })
            .eq('id', existingScore.id)
        } else {
          // Insert new score
          await supabase
            .from('quiz_scores')
            .insert({
              user_id: userData.id,
              test_type: 'post',
              score: scoreResult.percentage,
              points_earned: scoreResult.earned,
              points_total: scoreResult.total,
              taken_at: new Date().toISOString()
            })
        }
      }
    } catch (err) {
      console.error('Error saving score:', err)
      // Score is still shown even if save fails
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post-test...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Post-Test Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard/results')}
            className="w-full px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  if (submitted && score) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Post-Test Complete!</h2>
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-curare-blue mb-2">{score.percentage}%</div>
            <p className="text-lg text-gray-600">
              You scored {score.earned} out of {score.total} points
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard/results')}
              className="w-full px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Results Page
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  if (!currentQuestion) return null

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Post-Test Quiz</h1>
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-curare-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestion.question_number} ({currentQuestion.points || 1} point{currentQuestion.points !== 1 ? 's' : ''})
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.question_text}
          </h2>

          {/* Multiple Choice */}
          {currentQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {Object.entries(currentQuestion.options || {}).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.question_number] === key
                      ? 'border-curare-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.question_number}`}
                    value={key}
                    checked={answers[currentQuestion.question_number] === key}
                    onChange={(e) => handleAnswerChange(currentQuestion.question_number, e.target.value)}
                    className="mr-3 h-4 w-4 text-curare-blue"
                  />
                  <span className="font-medium text-gray-700 mr-2">{key}.</span>
                  <span className="text-gray-900">{value}</span>
                </label>
              ))}
            </div>
          )}

          {/* Fill in the Blank */}
          {currentQuestion.question_type === 'fill_in_blank' && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion.question_number] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.question_number, e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent text-lg"
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {/* Text Answer */}
          {currentQuestion.question_type === 'text_answer' && (
            <div>
              <textarea
                value={answers[currentQuestion.question_number] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.question_number, e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-curare-blue focus:border-transparent"
                placeholder="Type your answer here..."
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex gap-3">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Submit Test
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostTest




