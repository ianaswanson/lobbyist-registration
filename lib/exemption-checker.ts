/**
 * Exemption Checker Utility
 * Based on Multnomah County Ordinance §3.803
 */

export type ExemptionType =
  | "HOURS_THRESHOLD" // ≤10 hours per quarter
  | "NEWS_MEDIA" // News media publishing/broadcasting
  | "GOVERNMENT_OFFICIAL" // Acting in official capacity
  | "PUBLIC_TESTIMONY_ONLY" // Only giving public testimony
  | "COUNTY_REQUEST" // Responding to direct County request
  | "ADVISORY_COMMITTEE" // Advisory committee/commission/workgroup participant
  | "NONE" // No exemption - must register

export interface ExemptionCheckData {
  hoursPerQuarter: number
  isNewsMedia: boolean
  isGovernmentOfficial: boolean
  isPublicTestimonyOnly: boolean
  isRespondingToCountyRequest: boolean
  isAdvisoryCommitteeMember: boolean
}

export interface ExemptionResult {
  isExempt: boolean
  exemptionType: ExemptionType
  reason: string
  mustRegister: boolean
  registrationDeadline?: string // If applicable
}

export function checkExemption(data: ExemptionCheckData): ExemptionResult {
  // Check exemptions in order of specificity

  // 1. Hours threshold exemption
  if (data.hoursPerQuarter <= 10) {
    return {
      isExempt: true,
      exemptionType: "HOURS_THRESHOLD",
      reason:
        "You are exempt from registration because you spend 10 hours or less per quarter on lobbying activities (excluding travel time).",
      mustRegister: false,
    }
  }

  // 2. News media exemption
  if (data.isNewsMedia) {
    return {
      isExempt: true,
      exemptionType: "NEWS_MEDIA",
      reason:
        "You are exempt from registration as news media engaged in publishing or broadcasting news.",
      mustRegister: false,
    }
  }

  // 3. Government official exemption
  if (data.isGovernmentOfficial) {
    return {
      isExempt: true,
      exemptionType: "GOVERNMENT_OFFICIAL",
      reason:
        "You are exempt from registration as a government official acting in your official capacity.",
      mustRegister: false,
    }
  }

  // 4. Public testimony only exemption
  if (data.isPublicTestimonyOnly) {
    return {
      isExempt: true,
      exemptionType: "PUBLIC_TESTIMONY_ONLY",
      reason:
        "You are exempt from registration because you only provide public testimony and do not engage in other lobbying activities.",
      mustRegister: false,
    }
  }

  // 5. County request exemption
  if (data.isRespondingToCountyRequest) {
    return {
      isExempt: true,
      exemptionType: "COUNTY_REQUEST",
      reason:
        "You are exempt from registration because you are responding to a direct request from Multnomah County.",
      mustRegister: false,
    }
  }

  // 6. Advisory committee exemption
  if (data.isAdvisoryCommitteeMember) {
    return {
      isExempt: true,
      exemptionType: "ADVISORY_COMMITTEE",
      reason:
        "You are exempt from registration as a participant in an advisory committee, commission, or workgroup.",
      mustRegister: false,
    }
  }

  // No exemptions apply - must register
  const daysToRegister = 3 // 3 working days per ordinance
  const deadline = calculateRegistrationDeadline(daysToRegister)

  return {
    isExempt: false,
    exemptionType: "NONE",
    reason:
      "You must register as a lobbyist because you spend more than 10 hours per quarter on lobbying activities and no exemptions apply.",
    mustRegister: true,
    registrationDeadline: deadline,
  }
}

function calculateRegistrationDeadline(workingDays: number): string {
  const today = new Date()
  let daysAdded = 0
  let currentDate = new Date(today)

  while (daysAdded < workingDays) {
    currentDate.setDate(currentDate.getDate() + 1)
    const dayOfWeek = currentDate.getDay()

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++
    }
  }

  return currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Calculate hours per quarter based on activity tracking
 */
export function calculateHoursPerQuarter(activities: {
  date: string
  hours: number
}[]): number {
  const now = new Date()
  const currentQuarter = Math.floor(now.getMonth() / 3)
  const currentYear = now.getFullYear()

  // Get start and end dates of current quarter
  const quarterStart = new Date(currentYear, currentQuarter * 3, 1)
  const quarterEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0)

  // Sum hours in current quarter
  return activities
    .filter((activity) => {
      const activityDate = new Date(activity.date)
      return activityDate >= quarterStart && activityDate <= quarterEnd
    })
    .reduce((sum, activity) => sum + activity.hours, 0)
}
