/**
 * Analytics Sync Utility
 * Syncs localStorage analytics data to Supabase for admin dashboard
 */

import { supabase } from '../services/authService'
import { getUserId } from '../services/authService'
import { getAnalyticsData } from './analyticsTracker'
import { isCookieCategoryAllowed, COOKIE_CATEGORIES, isMinor, getCookieConsent } from './cookieManager'

/**
 * Sync analytics data to Supabase
 * Should be called periodically or on important events
 * Only syncs if:
 * 1. Analytical cookies are enabled
 * 2. User is NOT a minor (COPPA compliance)
 * 3. User has consented to all cookies (analytical + marketing)
 */
export const syncAnalyticsToSupabase = async () => {
  // Never sync for minors (COPPA compliance)
  if (isMinor()) {
    return
  }

  // Only sync if analytical cookies are enabled
  if (!isCookieCategoryAllowed(COOKIE_CATEGORIES.ANALYTICAL)) {
    return
  }

  // Only sync if user has consented to all cookies (analytical + marketing)
  // This ensures we only track users who explicitly opted in to all tracking
  const consent = getCookieConsent()
  if (!consent || !consent.analytical || !consent.marketing) {
    return
  }

  try {
    const userId = await getUserId()
    if (!userId) return

    const analytics = getAnalyticsData()
    const userEmail = (await supabase.auth.getUser()).data?.user?.email

    if (!userEmail) return

    // Sync flagged questions
    if (analytics.flaggedQuestions && analytics.flaggedQuestions.length > 0) {
      for (const item of analytics.flaggedQuestions) {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userId,
            user_email: userEmail,
            event_type: 'flagged_question',
            data: item,
            timestamp: item.timestamp || new Date().toISOString()
          })
          .catch(err => console.error('Failed to sync flagged question:', err))
      }
    }

    // Sync drop-offs
    if (analytics.dropOffs && analytics.dropOffs.length > 0) {
      for (const item of analytics.dropOffs) {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userId,
            user_email: userEmail,
            event_type: 'lesson_dropoff',
            data: item,
            timestamp: item.timestamp || new Date().toISOString()
          })
          .catch(err => console.error('Failed to sync drop-off:', err))
      }
    }

    // Sync session data
    if (analytics.sessionData && analytics.sessionData.length > 0) {
      for (const item of analytics.sessionData) {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userId,
            user_email: userEmail,
            event_type: 'session',
            data: item,
            timestamp: item.timestamp || new Date().toISOString()
          })
          .catch(err => console.error('Failed to sync session:', err))
      }
    }

    // Sync retention data
    if (analytics.retentionData && analytics.retentionData.length > 0) {
      for (const item of analytics.retentionData) {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: userId,
            user_email: userEmail,
            event_type: 'retention',
            data: item,
            timestamp: item.timestamp || new Date().toISOString()
          })
          .catch(err => console.error('Failed to sync retention:', err))
      }
    }
  } catch (error) {
    console.error('Error syncing analytics to Supabase:', error)
  }
}

/**
 * Initialize periodic sync (call this on app load)
 */
export const initializeAnalyticsSync = () => {
  // Sync every 5 minutes
  setInterval(() => {
    syncAnalyticsToSupabase()
  }, 5 * 60 * 1000)

  // Also sync on page unload
  window.addEventListener('beforeunload', () => {
    syncAnalyticsToSupabase()
  })
}
