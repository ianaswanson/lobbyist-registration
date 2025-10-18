"use client"

interface HourSummaryData {
  quarter: string
  year: number
  quarterStart: string
  quarterEnd: string
  daysRemaining: number
  totalHours: number
  thresholdExceeded: boolean
  hoursUntilThreshold: number
  registrationRequired: boolean
}

interface Props {
  summary: HourSummaryData
}

export function HourSummary({ summary }: Props) {
  const percentage = Math.min((summary.totalHours / 10) * 100, 100)
  const isNearThreshold = summary.totalHours >= 7 && !summary.thresholdExceeded
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {summary.quarter} {summary.year} Summary
        </h3>
        <div className="text-sm text-gray-500">
          {summary.daysRemaining} days remaining
        </div>
      </div>

      {/* Quarter Date Range */}
      <p className="text-sm text-gray-600 mb-4">
        {formatDate(summary.quarterStart)} - {formatDate(summary.quarterEnd)}
      </p>

      {/* Total Hours Display */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Lobbying Hours</span>
          <span className={`text-2xl font-bold ${summary.thresholdExceeded ? 'text-red-600' : 'text-gray-900'}`}>
            {summary.totalHours.toFixed(2)} / 10
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              summary.thresholdExceeded
                ? 'bg-red-600'
                : isNearThreshold
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={summary.totalHours}
            aria-valuemin={0}
            aria-valuemax={10}
            aria-label={`${summary.totalHours} hours out of 10 hour threshold`}
          />
        </div>

        {/* Helper Text */}
        <div className="mt-2">
          {summary.thresholdExceeded ? (
            <p className="text-sm font-medium text-red-600">
              ⚠️ Threshold exceeded - Registration required
            </p>
          ) : isNearThreshold ? (
            <p className="text-sm font-medium text-yellow-600">
              ⚡ Approaching threshold - {summary.hoursUntilThreshold.toFixed(2)} hours remaining
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              {summary.hoursUntilThreshold.toFixed(2)} hours until registration required
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Registration Requirement</h4>
            <p className="mt-1 text-sm text-blue-700">
              Per §3.802, you must register within <strong>3 working days</strong> after exceeding 10 hours
              of lobbying activity in a quarter. Track time spent communicating with county officials
              (excludes travel and research time).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
