/**
 * Feature Flags
 *
 * Controls which features are enabled in the application.
 * Use this to hide enhancements that aren't ordinance requirements.
 */

export const FEATURE_FLAGS = {
  /**
   * Hour Tracking - Enhancement (not ordinance requirement)
   *
   * Ordinance only requires registration within 3 days after exceeding 10 hours.
   * This tool helps lobbyists track hours voluntarily, but is NOT required.
   *
   * Set to false to hide from navigation and disable access.
   */
  HOUR_TRACKING: false,

  /**
   * Analytics Dashboard - Enhancement (not ordinance requirement)
   *
   * Ordinance only requires public posting of data.
   * This dashboard provides visualizations beyond basic requirements.
   *
   * Set to false to hide from navigation and disable access.
   */
  ANALYTICS_DASHBOARD: false,

  /**
   * Contract Exceptions - Ordinance Requirement (§9.230(C))
   *
   * This IS required by ordinance and should always be true.
   */
  CONTRACT_EXCEPTIONS: true,
} as const

export type FeatureFlag = keyof typeof FEATURE_FLAGS

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURE_FLAGS[feature] === true
}
