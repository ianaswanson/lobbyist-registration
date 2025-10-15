"use client"

import { ReviewActions } from "./ReviewActions"

interface Registration {
  id: string
  lobbyistName: string
  lobbyistEmail: string
  employerName: string
  subjectsOfInterest: string
  submittedDate: string
  hoursCurrentQuarter: number
  hasAuthorizationDoc: boolean
}

interface ReviewRegistrationsListProps {
  registrations: Registration[]
}

export function ReviewRegistrationsList({
  registrations,
}: ReviewRegistrationsListProps) {
  if (registrations.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No Pending Registrations
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          All registrations have been reviewed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {registrations.map((registration) => (
        <div
          key={registration.id}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {registration.lobbyistName}
                </h3>
                <span className="ml-3 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Pending Review
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {registration.lobbyistEmail}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              Submitted {registration.submittedDate}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Employer
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {registration.employerName}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Hours This Quarter
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {registration.hoursCurrentQuarter} hours
              </p>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Subjects of Interest
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {registration.subjectsOfInterest}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Authorization Document
              </label>
              <p className="mt-1 text-sm">
                {registration.hasAuthorizationDoc ? (
                  <span className="text-green-600 flex items-center">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Uploaded
                  </span>
                ) : (
                  <span className="text-red-600">Not uploaded</span>
                )}
              </p>
            </div>
          </div>

          {/* Review Actions */}
          <div className="mt-6 border-t pt-4">
            <ReviewActions
              entityName={registration.lobbyistName}
              onApprove={() =>
                alert(`Registration approved for ${registration.lobbyistName}`)
              }
              onReject={() =>
                alert(`Registration rejected for ${registration.lobbyistName}`)
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
