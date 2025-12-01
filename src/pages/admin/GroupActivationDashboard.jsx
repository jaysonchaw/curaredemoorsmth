import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const GroupActivationDashboard = () => {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [ulis, setUlis] = useState([])
  const [selectedUlis, setSelectedUlis] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const adminKey = 'devsecure' // In production, get from secure storage

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchULIs(selectedGroup)
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    try {
      setError('')
      const response = await fetch(`http://localhost:3001/api/admin/groups?adminKey=${adminKey}`)
      const data = await response.json()
      
      if (response.ok) {
        setGroups(data || [])
        if (!data || data.length === 0) {
          // Try to initialize if no groups found
          try {
            const initResponse = await fetch(`http://localhost:3001/api/admin/initialize?adminKey=${adminKey}`, {
              method: 'POST',
              headers: {
                'x-admin-key': adminKey,
              },
            })
            if (initResponse.ok) {
              // Retry fetching groups
              const retryResponse = await fetch(`http://localhost:3001/api/admin/groups?adminKey=${adminKey}`)
              const retryData = await retryResponse.json()
              if (retryResponse.ok) {
                setGroups(retryData || [])
              }
            }
          } catch (initErr) {
            console.error('Initialization error:', initErr)
          }
        }
      } else {
        setError(data.error || 'Failed to fetch groups')
      }
    } catch (err) {
      console.error('Fetch groups error:', err)
      setError(`Network error: ${err.message}. Please check if the server is running.`)
    } finally {
      setLoading(false)
    }
  }

  const fetchULIs = async (groupNumber) => {
    try {
      setError('')
      const response = await fetch(`http://localhost:3001/api/admin/groups/${groupNumber}/ulis?adminKey=${adminKey}`)
      const data = await response.json()
      
      if (response.ok) {
        setUlis(data || [])
        if (!data || data.length === 0) {
          setError(`No ULIs found for group ${groupNumber}. The database may still be initializing. Please wait a moment and try again.`)
        }
      } else {
        setError(data.error || 'Failed to fetch ULIs. The database may still be initializing.')
      }
    } catch (err) {
      console.error('Fetch ULIs error:', err)
      setError(`Network error fetching ULIs: ${err.message}. Make sure the server is running and try again.`)
    }
  }

  const handleToggleGroup = async (groupNumber, currentlyActivated) => {
    try {
      setError('')
      setSuccess('')
      
      if (currentlyActivated) {
        // Deactivate group
        const response = await fetch(`http://localhost:3001/api/admin/groups/${groupNumber}/deactivate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-key': adminKey,
          },
        })

        const data = await response.json()

        if (response.ok) {
          setSuccess(data.message || `Group ${groupNumber} deactivated successfully`)
          fetchGroups() // Refresh groups
          if (selectedGroup === groupNumber) {
            fetchULIs(groupNumber) // Refresh ULIs
          }
        } else {
          setError(data.error || 'Failed to deactivate group')
        }
      } else {
        // For activation, show ULIs for selection first
        setSelectedGroup(groupNumber)
        // Try to initialize database first if needed
        try {
          const initResponse = await fetch(`http://localhost:3001/api/admin/initialize?adminKey=${adminKey}`, {
            method: 'POST',
            headers: {
              'x-admin-key': adminKey,
            },
          })
          if (!initResponse.ok) {
            const initData = await initResponse.json()
            console.warn('Initialization warning:', initData)
          }
        } catch (initErr) {
          console.error('Initialization error:', initErr)
        }
        // Fetch ULIs for this group
        await fetchULIs(groupNumber)
        setSuccess(`Select which ULIs to activate for Group ${groupNumber}, then click "Activate Group + Selected ULIs"`)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleActivateGroupWithSelectedULIs = async () => {
    if (!selectedGroup) {
      setError('Please select a group first')
      return
    }

    if (selectedUlis.length === 0) {
      setError('Please select at least one ULI to activate')
      return
    }

    try {
      setError('')
      setSuccess('')
      
      const response = await fetch(`http://localhost:3001/api/admin/groups/${selectedGroup}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ uliIds: selectedUlis }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || `Group ${selectedGroup} activated with ${selectedUlis.length} ULI(s)`)
        setSelectedUlis([])
        fetchGroups() // Refresh groups
        fetchULIs(selectedGroup) // Refresh ULIs
      } else {
        setError(data.error || 'Failed to activate group')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleToggleULI = (uliId) => {
    // Don't allow selecting already activated ULIs
    const uli = ulis.find(u => u.id === uliId)
    if (uli?.activated) {
      return
    }
    
    if (selectedUlis.includes(uliId)) {
      setSelectedUlis(selectedUlis.filter(id => id !== uliId))
    } else {
      setSelectedUlis([...selectedUlis, uliId])
    }
  }

  const handleBulkActivateULIs = async () => {
    if (selectedUlis.length === 0) {
      setError('Please select at least one ULI to activate')
      return
    }

    try {
      setError('')
      setSuccess('')
      
      const response = await fetch('http://localhost:3001/api/admin/ulis/bulk-activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ uliIds: selectedUlis }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setSelectedUlis([])
        if (selectedGroup) {
          fetchULIs(selectedGroup)
        }
      } else {
        setError(data.error || 'Failed to activate ULIs')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysRemaining = (countdownEndDate) => {
    if (!countdownEndDate) return null
    const now = new Date()
    const end = new Date(countdownEndDate)
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Activation Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage group and ULI activations</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Groups Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Groups 1-20</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((groupNum) => {
              const group = groups.find(g => g.group_number === groupNum)
              const isActivated = group?.activated || false
              const daysRemaining = group?.countdown_end_date ? getDaysRemaining(group.countdown_end_date) : null

              return (
                <div
                  key={groupNum}
                  className={`bg-white rounded-lg shadow-md p-4 border-2 ${
                    isActivated ? 'border-green-500' : 'border-gray-200'
                  } cursor-pointer hover:shadow-lg transition-shadow`}
                  onClick={() => setSelectedGroup(groupNum)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Group {groupNum}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        isActivated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isActivated ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {group?.group_code && (
                    <p className="text-sm text-gray-600 mb-2">Code: {group.group_code}</p>
                  )}
                  
                  {isActivated && daysRemaining !== null && (
                    <p className="text-sm text-gray-600 mb-2">
                      {daysRemaining > 0 ? (
                        <>
                          {Math.floor(daysRemaining / 7) > 0 && `${Math.floor(daysRemaining / 7)} week${Math.floor(daysRemaining / 7) > 1 ? 's' : ''} `}
                          {daysRemaining % 7 > 0 && `${daysRemaining % 7} day${daysRemaining % 7 > 1 ? 's' : ''} `}
                          until post-test
                        </>
                      ) : 'Post-test available'}
                    </p>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleGroup(groupNum, isActivated)
                    }}
                    className={`w-full mt-2 px-3 py-2 rounded-lg font-medium text-sm ${
                      isActivated
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isActivated ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ULIs Section */}
        {selectedGroup && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                ULIs for Group {selectedGroup}
              </h2>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {selectedUlis.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-blue-800">
                    {selectedUlis.length} ULI(s) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkActivateULIs}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Activate Selected ULIs Only
                    </button>
                    {!groups.find(g => g.group_number === selectedGroup)?.activated && (
                      <button
                        onClick={handleActivateGroupWithSelectedULIs}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Activate Group + Selected ULIs
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {selectedGroup && !groups.find(g => g.group_number === selectedGroup)?.activated && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Select ULIs above, then click "Activate Group + Selected ULIs" to activate the group and start the 27-day countdown timer.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {ulis.map((uli) => (
                <div
                  key={uli.id}
                  className={`p-3 rounded-lg border-2 ${
                    uli.activated
                      ? 'border-green-500 bg-green-50 cursor-not-allowed opacity-75'
                      : selectedUlis.includes(uli.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  } ${uli.activated ? '' : 'cursor-pointer hover:shadow-md'} transition-shadow`}
                  onClick={() => handleToggleULI(uli.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-mono text-sm text-gray-900">{uli.uli_value}</p>
                      {uli.activated && (
                        <p className="text-xs text-gray-600 mt-1">
                          Activated: {formatDate(uli.activated_at)}
                        </p>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUlis.includes(uli.id)}
                      onChange={() => handleToggleULI(uli.id)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={uli.activated}
                      className="ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GroupActivationDashboard

