import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Wait a bit for Supabase to process the hash if present
        if (window.location.hash) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (session?.user) {
          // Try to get from URL params first, then from localStorage
          let uli = searchParams.get('uli')
          let group = searchParams.get('group')
          let birthday = searchParams.get('birthday')
          let parentEmail = searchParams.get('parentEmail')
          let parentConsent = searchParams.get('parentConsent') === 'true'
          let accessCode = searchParams.get('accessCode')
          
          // Always try localStorage as fallback (for email verification and Google OAuth)
          const storedData = localStorage.getItem('curare_signup_data')
          if (storedData) {
            try {
              const data = JSON.parse(storedData)
              uli = uli || data.uli
              group = group || data.group
              birthday = birthday || data.birthday
              parentEmail = parentEmail || data.parentEmail
              parentConsent = parentConsent || data.parentConsent
              accessCode = accessCode || data.accessCode
            } catch (e) {
              console.error('Error parsing stored signup data:', e)
            }
          }
          
          // Also try to get from user metadata (stored during signup)
          const userMetadata = session.user.user_metadata || {}
          uli = uli || userMetadata.uli
          group = group || userMetadata.group_number
          birthday = birthday || userMetadata.birthday
          parentEmail = parentEmail || userMetadata.parent_email
          parentConsent = parentConsent || userMetadata.parent_consent || false
          accessCode = accessCode || userMetadata.access_code
          

          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!existingUser) {
            // Validate that we have required data (uli and group)
            if (!uli || !group) {
              console.error('Missing ULI or group data')
              const storedData = localStorage.getItem('curare_signup_data')
              if (storedData) {
                try {
                  const data = JSON.parse(storedData)
                  navigate(`/signup?accessCode=${encodeURIComponent(data.accessCode || '')}&uli=${encodeURIComponent(data.uli || '')}&group=${data.group || ''}&error=missing_data`)
                } catch (e) {
                  navigate('/signup?error=missing_uli_group')
                }
              } else {
                navigate('/signup?error=missing_uli_group')
              }
              return
            }

            // Create new user record
            // IMPORTANT: session.user.email is the STUDENT's login email (from auth.users.email)
            // parent_email is ONLY for verification purposes, NOT for login
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email, // STUDENT's email - used for login
                full_name: userMetadata.full_name || '',
                uli: uli,
                group_number: parseInt(group),
                birthday: birthday || null,
                parent_email: parentEmail || null, // PARENT's email - ONLY for verification, NOT for login
                parent_consent: parentConsent || false,
                has_completed_intro: false,
                xp: 0,
                level: 1
              })

            if (insertError) {
              console.error('Error creating user:', insertError)
              // Clear localStorage after error
              localStorage.removeItem('curare_signup_data')
              // If ULI constraint error, user might have already signed up - check if it's the same user
              if (insertError.code === '23505') {
                // Check if this ULI belongs to this user
                const { data: uliOwner } = await supabase
                  .from('users')
                  .select('id')
                  .eq('uli', uli)
                  .single()
                
                if (uliOwner && uliOwner.id === session.user.id) {
                  // Same user, just continue
                  localStorage.removeItem('curare_signup_data')
                } else {
                  navigate(`/signup?accessCode=${encodeURIComponent(accessCode || '')}&uli=${encodeURIComponent(uli || '')}&group=${group || ''}&error=uli_already_used`)
                  return
                }
              } else {
                // For other errors, try to continue if table doesn't exist
                if (insertError.code === '42P01' || insertError.message?.includes('does not exist')) {
                  localStorage.removeItem('curare_signup_data')
                } else {
                  navigate(`/signup?accessCode=${encodeURIComponent(accessCode || '')}&uli=${encodeURIComponent(uli || '')}&group=${group || ''}&error=user_creation_failed`)
                  return
                }
              }
            } else {
              // Clear localStorage after successful user creation
              localStorage.removeItem('curare_signup_data')
            }
          }

          // Check if user has completed intro
          try {
            const { data: userData, error: userDataError } = await supabase
              .from('users')
              .select('has_completed_intro')
              .eq('id', session.user.id)
              .maybeSingle()

            // If table doesn't exist or user not found, go to intro
            if (userDataError && (userDataError.code === '42P01' || userDataError.message?.includes('does not exist'))) {
              navigate('/introduction')
            } else if (userData && !userData.has_completed_intro) {
              navigate('/introduction')
            } else if (userData) {
              navigate('/dashboard')
            } else {
              // User record doesn't exist, go to intro
              navigate('/introduction')
            }
          } catch (err) {
            console.error('Error checking user data:', err)
            navigate('/introduction')
          }
        } else {
          // Try to preserve signup data when redirecting
          const storedData = localStorage.getItem('curare_signup_data')
          if (storedData) {
            try {
              const data = JSON.parse(storedData)
              navigate(`/signup?accessCode=${encodeURIComponent(data.accessCode || '')}&uli=${encodeURIComponent(data.uli || '')}&group=${data.group || ''}`)
            } catch (e) {
              console.error('Error parsing stored data:', e)
              navigate('/signup')
            }
          } else {
            navigate('/signup')
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
        // Try to preserve signup data when redirecting
        const storedData = localStorage.getItem('curare_signup_data')
        if (storedData) {
          try {
            const data = JSON.parse(storedData)
            navigate(`/signup?accessCode=${encodeURIComponent(data.accessCode || '')}&uli=${encodeURIComponent(data.uli || '')}&group=${data.group || ''}&error=auth_failed`)
          } catch (e) {
            navigate('/signup?error=auth_failed')
          }
        } else {
          navigate('/signup?error=auth_failed')
        }
      }
    }

    handleAuth()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curare-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Completing signup...</p>
      </div>
    </div>
  )
}

export default AuthCallback

