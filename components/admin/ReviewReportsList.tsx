"use client"

import { ReviewActions } from "./ReviewActions"

interface Report {
  id: string
  type: string
  submitterName: string
  submitterEmail: string
  quarter: string
  year: number
  totalAmount: number
  expenseCount: number
  submittedDate: string
  hasDocuments: boolean
}

interface ReviewReportsListProps {
  reports: Report[]
}

export function ReviewReportsList({ reports }: ReviewReportsListProps) {
  if (reports.length === 0) {
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
          No Pending Reports
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          All expense reports have been reviewed
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-lg border bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.submitterName}
                </h3>
                <span className="ml-3 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                  Pending Review
                </span>
                <span
                  className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${
                    report.type === "Lobbyist Expense Report"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {report.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {report.submitterEmail}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              Submitted {report.submittedDate}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Reporting Period
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {report.quarter} {report.year}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Amount
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                ${report.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Expense Items
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {report.expenseCount} items
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-6">
            <div className="flex items-center text-sm">
              {report.hasDocuments ? (
                <>
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-700">
                    Supporting documents attached
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-500">
                    No supporting documents
                  </span>
                </>
              )}
            </div>
            <button
              type="button"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
              onClick={() => alert("View detailed report (not implemented)")}
            >
              View Full Report →
            </button>
          </div>

          {/* Review Actions */}
          <div className="mt-6 border-t pt-4">
            <ReviewActions
              entityName={report.submitterName}
              onApprove={() =>
                alert(`Report approved for ${report.submitterName}`)
              }
              onReject={() =>
                alert(`Report rejected for ${report.submitterName}`)
              }
              onRequestClarification={() =>
                alert(`Requesting clarification from ${report.submitterName}`)
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
