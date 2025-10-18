"use client"

interface Props {
  thresholdExceededDate: string | null
  registrationDeadline: string | null
  registrationStatus: string
}

export function ThresholdAlert({ thresholdExceededDate, registrationDeadline, registrationStatus }: Props) {
  const formatDate = (date: string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isRegistered = registrationStatus === "APPROVED"
  const isPending = registrationStatus === "PENDING"

  // Calculate if deadline is approaching (within 1 day)
  const isDeadlineClose = registrationDeadline
    ? new Date(registrationDeadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : false

  return (
    <div className={`rounded-lg p-6 shadow border-l-4 ${
      isRegistered
        ? 'bg-green-50 border-green-500'
        : isPending
        ? 'bg-yellow-50 border-yellow-500'
        : isDeadlineClose
        ? 'bg-red-50 border-red-500'
        : 'bg-orange-50 border-orange-500'
    }`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {isRegistered ? (
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-lg font-semibold ${
            isRegistered
              ? 'text-green-800'
              : isDeadlineClose
              ? 'text-red-800'
              : 'text-orange-800'
          }`}>
            {isRegistered
              ? '✓ Registration Complete'
              : isPending
              ? '⏳ Registration Pending'
              : '⚠️ Registration Required'}
          </h3>

          <div className="mt-2 text-sm">
            {isRegistered ? (
              <p className="text-green-700">
                Your lobbyist registration is active. You're in compliance with the 10-hour threshold requirement.
              </p>
            ) : isPending ? (
              <div className="text-yellow-700 space-y-1">
                <p>Your registration is pending admin review.</p>
                <p className="font-medium">
                  Threshold exceeded: {formatDate(thresholdExceededDate)}
                </p>
                <p className="font-medium">
                  Registration deadline: {formatDate(registrationDeadline)}
                </p>
              </div>
            ) : (
              <div className={isDeadlineClose ? 'text-red-700' : 'text-orange-700'}>
                <p className="font-medium mb-2">
                  You have exceeded 10 lobbying hours in this quarter. Registration is required within 3 working days.
                </p>
                <div className="space-y-1">
                  <p>
                    <strong>Threshold exceeded:</strong> {formatDate(thresholdExceededDate)}
                  </p>
                  <p className={isDeadlineClose ? 'font-bold text-lg' : ''}>
                    <strong>Registration deadline:</strong> {formatDate(registrationDeadline)}
                    {isDeadlineClose && ' 🚨'}
                  </p>
                </div>

                <div className="mt-4">
                  <a
                    href="/register/lobbyist"
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isDeadlineClose
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  >
                    Register Now →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
