/**
 * Cookie Management System
 * Handles cookie consent, storage, and tracking in compliance with GDPR, COPPA, etc.
 */

// Cookie categories
export const COOKIE_CATEGORIES = {
  ESSENTIAL: 'essential',
  ANALYTICAL: 'analytical',
  MARKETING: 'marketing'
}

// Cookie names by category
const COOKIE_NAMES = {
  [COOKIE_CATEGORIES.ESSENTIAL]: [
    'session_token',
    'csrf_token',
    'authToken',
    'user',
    'AWSALB', // Load balancer cookie
    'AWSALBCORS',
    'curare_user_location' // Locational data is essential
  ],
  [COOKIE_CATEGORIES.ANALYTICAL]: [
    'analytics_session_id',
    'analytics_user_id',
    'analytics_flagged_questions',
    'analytics_drop_offs',
    'analytics_session_data',
    'analytics_retention_data'
  ],
  [COOKIE_CATEGORIES.MARKETING]: [
    'marketing_campaign_id',
    'marketing_source'
  ]
}

// Storage keys
const CONSENT_KEY = 'curare_cookie_consent'
const CONSENT_TIMESTAMP_KEY = 'curare_cookie_consent_timestamp'
const USER_AGE_KEY = 'curare_user_age'
const USER_LOCATION_KEY = 'curare_user_location'

/**
 * Get user's age from localStorage (set during onboarding)
 */
export const getUserAge = () => {
  try {
    const age = localStorage.getItem(USER_AGE_KEY)
    return age ? parseInt(age, 10) : null
  } catch (e) {
    return null
  }
}

/**
 * Set user's age (called during onboarding)
 */
export const setUserAge = (age) => {
  try {
    localStorage.setItem(USER_AGE_KEY, String(age))
  } catch (e) {
    console.error('Failed to set user age', e)
  }
}

/**
 * Detect if user is in EU/UK based on timezone or IP (simplified)
 * For production, you'd want to use a proper geolocation service
 */
export const detectUserLocation = async () => {
  try {
    // Check if already stored
    const stored = localStorage.getItem(USER_LOCATION_KEY)
    if (stored) {
      return stored
    }

    // Simple detection based on timezone (not perfect, but works for basic cases)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const euTimezones = [
      'Europe/', 'Atlantic/Azores', 'Atlantic/Canary', 'Atlantic/Madeira'
    ]
    const isEU = euTimezones.some(tz => timezone.startsWith(tz))
    
    // UK timezone
    const isUK = timezone === 'Europe/London'
    
    const location = (isEU || isUK) ? 'EU/UK' : 'OTHER'
    localStorage.setItem(USER_LOCATION_KEY, location)
    return location
  } catch (e) {
    return 'OTHER'
  }
}

/**
 * Check if user is a minor (< 13)
 */
export const isMinor = () => {
  const age = getUserAge()
  return age !== null && age < 13
}

/**
 * Check if user is in EU/UK
 */
export const isEUUK = async () => {
  const location = await detectUserLocation()
  return location === 'EU/UK'
}

/**
 * Get current cookie consent preferences
 */
export const getCookieConsent = () => {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * Set cookie consent preferences
 */
export const setCookieConsent = (preferences) => {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences))
    localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString())
    
    // Apply cookie settings immediately
    applyCookieSettings(preferences)
  } catch (e) {
    console.error('Failed to set cookie consent', e)
  }
}

/**
 * Initialize cookie consent based on user age and location
 */
export const initializeCookieConsent = async () => {
  const existingConsent = getCookieConsent()
  if (existingConsent) {
    // Already has consent, apply it
    applyCookieSettings(existingConsent)
    return existingConsent
  }

  const age = getUserAge()
  const location = await detectUserLocation()
  
  let preferences = {
    essential: true, // Always true
    analytical: false,
    marketing: false
  }

  // Minors: only essential, cannot enable others
  if (age !== null && age < 13) {
    preferences.analytical = false
    preferences.marketing = false
  } 
  // EU/UK: default to essential only, but can enable later
  else if (location === 'EU/UK') {
    preferences.analytical = false
    preferences.marketing = false
  }
  // Others: default to all (but still require explicit consent)
  else {
    // Still default to essential only for GDPR compliance
    preferences.analytical = false
    preferences.marketing = false
  }

  setCookieConsent(preferences)
  return preferences
}

/**
 * Apply cookie settings - enable/disable cookies based on consent
 */
export const applyCookieSettings = (preferences) => {
  // Always keep essential cookies
  // Essential cookies are managed by the app (session, auth, etc.)
  
  // Remove analytical cookies if disabled
  if (!preferences.analytical) {
    removeCookiesByCategory(COOKIE_CATEGORIES.ANALYTICAL)
    // Clear analytical data from localStorage
    clearAnalyticalData()
  }

  // Remove marketing cookies if disabled
  if (!preferences.marketing) {
    removeCookiesByCategory(COOKIE_CATEGORIES.MARKETING)
  }
}

/**
 * Remove all cookies in a category
 */
const removeCookiesByCategory = (category) => {
  const cookies = COOKIE_NAMES[category] || []
  cookies.forEach(cookieName => {
    // Remove from document.cookie
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
    
    // Remove from localStorage
    try {
      localStorage.removeItem(cookieName)
    } catch (e) {
      // Ignore
    }
  })
}

/**
 * Clear analytical data from localStorage
 */
const clearAnalyticalData = () => {
  const keysToRemove = [
    'analytics_session_id',
    'analytics_user_id',
    'analytics_flagged_questions',
    'analytics_drop_offs',
    'analytics_session_data',
    'analytics_retention_data',
    'analytics_active_sessions'
  ]
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      // Ignore
    }
  })
}

/**
 * Check if a cookie category is allowed
 */
export const isCookieCategoryAllowed = (category) => {
  const consent = getCookieConsent()
  if (!consent) return false
  
  if (category === COOKIE_CATEGORIES.ESSENTIAL) {
    return true // Always allowed
  }
  
  return consent[category] === true
}

/**
 * Set a cookie (only if category is allowed)
 */
export const setCookie = (name, value, category, days = 365) => {
  if (category !== COOKIE_CATEGORIES.ESSENTIAL && !isCookieCategoryAllowed(category)) {
    return false
  }

  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    return true
  } catch (e) {
    console.error('Failed to set cookie', e)
    return false
  }
}

/**
 * Get a cookie value
 */
export const getCookie = (name) => {
  try {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  } catch (e) {
    return null
  }
}

/**
 * Delete a cookie
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
}

/**
 * Generate a CSRF token
 */
const generateCSRFToken = () => {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for older browsers
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create CSRF token cookie
 */
export const getCSRFToken = () => {
  let token = getCookie('csrf_token')
  if (!token) {
    token = generateCSRFToken()
    // Set CSRF token cookie (essential, so always allowed)
    setCookie('csrf_token', token, COOKIE_CATEGORIES.ESSENTIAL, 365)
  }
  return token
}

/**
 * Set session token cookie (essential)
 * This replaces localStorage authToken with a proper cookie
 */
export const setSessionToken = (token) => {
  if (!token) {
    // Remove session token if null/empty
    deleteCookie('session_token')
    return false
  }
  
  // Set session token cookie (expires in 7 days, or match Supabase session expiry)
  // Using HttpOnly-like approach: we can't set HttpOnly from JS, but we can set Secure and SameSite
  const expires = new Date()
  expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 days
  
  try {
    // Set cookie with Secure flag in production (HTTPS only)
    const isSecure = window.location.protocol === 'https:'
    const secureFlag = isSecure ? '; Secure' : ''
    document.cookie = `session_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`
    
    // Also keep in localStorage for backward compatibility during migration
    localStorage.setItem('authToken', token)
    return true
  } catch (e) {
    console.error('Failed to set session token cookie', e)
    return false
  }
}

/**
 * Get session token from cookie (fallback to localStorage for migration)
 */
export const getSessionToken = () => {
  const cookieToken = getCookie('session_token')
  if (cookieToken) {
    return cookieToken
  }
  
  // Fallback to localStorage for backward compatibility
  const localToken = localStorage.getItem('authToken')
  if (localToken) {
    // Migrate to cookie
    setSessionToken(localToken)
    return localToken
  }
  
  return null
}

/**
 * Remove session token cookie
 */
export const removeSessionToken = () => {
  deleteCookie('session_token')
  localStorage.removeItem('authToken')
}

/**
 * Initialize essential cookies on app load
 * Sets CSRF token and migrates session token from localStorage if needed
 */
export const initializeEssentialCookies = () => {
  // Generate CSRF token if it doesn't exist
  getCSRFToken()
  
  // Migrate session token from localStorage to cookie if it exists
  const localToken = localStorage.getItem('authToken')
  if (localToken && !getCookie('session_token')) {
    setSessionToken(localToken)
  }
  
  // Preserve AWS load balancer cookies if they exist (they're set by AWS automatically)
  // We don't need to do anything - they're already cookies and will persist
}
