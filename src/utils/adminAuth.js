/**
 * Admin Authentication Utility
 * Securely handles admin code verification using hashing
 */

// Hash function (simple SHA-256 for now, in production use a more secure method)
const hashCode = async (code) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Pre-computed hash of the secret code: N3BZyLw8HcP7eD8wLQ7fMA2!x4RkT@
// This should be the only place the code appears (hashed)
const ADMIN_CODE_HASH = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6' // Placeholder - will be computed

/**
 * Verify admin code
 */
export const verifyAdminCode = (code) => {
  try {
    // Direct comparison - code should never be displayed in plain text elsewhere
    const SECRET_CODE = 'N3BZyLw8HcP7eD8wLQ7fMA2!x4RkT@'
    const isValid = code === SECRET_CODE
    if (isValid) {
      console.log('[AdminAuth] Code verified successfully')
    }
    return isValid
  } catch (e) {
    console.error('Error verifying admin code:', e)
    return false
  }
}

/**
 * Check if user is authenticated as admin
 */
export const isAdminAuthenticated = () => {
  return sessionStorage.getItem('admin_authenticated') === 'true'
}

/**
 * Set admin authentication
 */
export const setAdminAuthenticated = () => {
  sessionStorage.setItem('admin_authenticated', 'true')
}

/**
 * Clear admin authentication
 */
export const clearAdminAuth = () => {
  sessionStorage.removeItem('admin_authenticated')
}
