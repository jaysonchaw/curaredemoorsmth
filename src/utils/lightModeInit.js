// Initialize light mode before React renders
// This prevents the flash/flicker when pages load
export const getInitialLightMode = () => {
  try {
    // First, check localStorage for saved preference
    const stored = localStorage.getItem('tsv2LightMode')
    
    let isLightMode
    if (stored !== null) {
      // Use saved preference if it exists
      isLightMode = stored === 'true'
    } else {
      // Fall back to system preference if no saved preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches
      } else {
        // Default to dark mode if matchMedia not available
        isLightMode = false
      }
    }
    
    const bgColor = isLightMode ? '#ffffff' : '#161d25ff'
    
    // Set background immediately to prevent flash
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = bgColor
      document.documentElement.style.backgroundColor = bgColor
    }
    
    return isLightMode
  } catch (e) {
    // Fall back to system preference on error
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: light)').matches
      }
    } catch (e2) {
      // Default to dark mode if all else fails
      return false
    }
    return false
  }
}

