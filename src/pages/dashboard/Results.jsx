import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/authService'

const Results = () => {
  const { userData } = useOutletContext()
  const navigate = useNavigate()
  const [results, setResults] = useState({
    postTestScore: null,
    badges: [],
    certificates: []
  })
  const [postTestAvailability, setPostTestAvailability] = useState({
    available: false,
    daysRemaining: null,
    loading: true
  })

  useEffect(() => {
    const fetchResults = async () => {
      if (!userData) return

      try {
        // Fetch pre-test and post-test scores from quiz_scores table
        const { data: quizScores } = await supabase
          .from('quiz_scores')
          .select('test_type, score')
          .eq('user_id', userData.id)
          .order('taken_at', { ascending: false })

        let postTestScore = null

        if (quizScores) {
          const postTest = quizScores.find(s => s.test_type === 'post')
          postTestScore = postTest ? postTest.score : null
        }

        // Fetch user badges with badge details
        const { data: userBadgesData } = await supabase
          .from('user_badges')
          .select(`
            badge_id,
            earned_at,
            badges (
              id,
              name,
              description,
              icon_url
            )
          `)
          .eq('user_id', userData.id)

        const badges = userBadgesData?.map(ub => ({
          id: ub.badge_id,
          name: ub.badges?.name || 'Unknown Badge',
          description: ub.badges?.description || '',
          earned: true,
          earnedAt: ub.earned_at
        })) || []

        // Fetch all available badges to show unearned ones
        const { data: allBadges } = await supabase
          .from('badges')
          .select('id, name, description, icon_url')

        if (allBadges) {
          const earnedBadgeIds = new Set(badges.map(b => b.id))
          const unearnedBadges = allBadges
            .filter(b => !earnedBadgeIds.has(b.id))
            .map(b => ({
              id: b.id,
              name: b.name,
              description: b.description || '',
              earned: false
            }))
          badges.push(...unearnedBadges)
        }

        // Fetch certificates
        const { data: certificatesData } = await supabase
          .from('certificates')
          .select('id, name, earned_at')
          .eq('user_id', userData.id)
          .order('earned_at', { ascending: false })

        const certificates = certificatesData?.map(c => ({
          id: c.id,
          name: c.name,
          date: c.earned_at
        })) || []

        setResults({
          postTestScore,
          badges,
          certificates
        })
      } catch (error) {
        console.error('Error fetching results:', error)
        // Set to empty/null values on error
        setResults({
          postTestScore: null,
          badges: [],
          certificates: []
        })
      }
    }

    fetchResults()
  }, [userData])

  // Check post-test availability
  useEffect(() => {
    const checkPostTestAvailability = async () => {
      if (!userData?.id) {
        setPostTestAvailability({ available: false, daysRemaining: null, loading: false })
        return
      }

      try {
        const response = await fetch(`http://localhost:3001/api/post-test/availability?userId=${userData.id}`)
        const data = await response.json()
        
        setPostTestAvailability({
          available: data.available || false,
          daysRemaining: data.daysRemaining,
          loading: false
        })
      } catch (error) {
        console.error('Error checking post-test availability:', error)
        setPostTestAvailability({ available: false, daysRemaining: null, loading: false })
      }
    }

    checkPostTestAvailability()
  }, [userData])

  const handleExportProgress = (format) => {
    // Would generate and download CSV or PDF
    alert(`Progress export as ${format} would be generated here`)
  }

  const handleDownloadCertificate = (certificateId) => {
    // Would generate and download PDF certificate
    alert(`Certificate PDF would be generated here`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Results & Achievements</h1>
        <p className="text-gray-600">Track your progress and view your accomplishments</p>
      </div>

      {/* Quiz Scores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Scores</h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="border-2 border-curare-blue rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Post-Test Score</h3>
            {results.postTestScore !== null ? (
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-curare-blue">{results.postTestScore}%</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-curare-blue h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, results.postTestScore || 0))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {postTestAvailability.loading ? (
                  <p className="text-gray-500">Checking availability...</p>
                ) : postTestAvailability.available ? (
                  <div>
                    <p className="text-gray-600 mb-4">Post-test is now available!</p>
                    <button
                      onClick={() => navigate('/dashboard/post-test')}
                      className="px-6 py-3 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Take Post-Test
                    </button>
                  </div>
                ) : postTestAvailability.daysRemaining !== null && postTestAvailability.daysRemaining > 0 ? (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Post-test will be available in:
                    </p>
                    <p className="text-lg font-semibold text-curare-blue mb-4">
                      {Math.floor(postTestAvailability.daysRemaining / 7) > 0 && `${Math.floor(postTestAvailability.daysRemaining / 7)} week${Math.floor(postTestAvailability.daysRemaining / 7) > 1 ? 's' : ''} `}
                      {postTestAvailability.daysRemaining % 7 > 0 && `${postTestAvailability.daysRemaining % 7} day${postTestAvailability.daysRemaining % 7 > 1 ? 's' : ''}`}
                    </p>
                    <p className="text-sm text-gray-500">Check back when the countdown ends</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Not yet available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Badges</h2>
        {results.badges.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No badges available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 border-2 rounded-lg ${
                badge.earned
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`text-3xl ${badge.earned ? '' : 'grayscale'}`}>
                  🏆
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                  {badge.earned && (
                    <span className="inline-block mt-2 text-xs font-medium text-green-600">
                      ✓ Earned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Certificates */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Certificates</h2>
        {results.certificates.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No certificates earned yet.</p>
        ) : (
          <div className="space-y-4">
            {results.certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-gray-600">Earned on {new Date(cert.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleDownloadCertificate(cert.id)}
                  className="px-4 py-2 bg-curare-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Progress</h2>
        <p className="text-gray-600 mb-4">Download your progress data for your records</p>
        <div className="flex space-x-4">
          <button
            onClick={() => handleExportProgress('CSV')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Export as CSV
          </button>
          <button
            onClick={() => handleExportProgress('PDF')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  )
}

export default Results

