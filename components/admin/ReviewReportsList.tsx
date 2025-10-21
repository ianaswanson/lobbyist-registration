"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ReviewActions } from "./ReviewActions"

interface Report {
  id: string
  type: string
  reportType: "lobbyist" | "employer"
  submitterName: string
  submitterEmail: string
  quarter: string
  year: number
  totalAmount: number
  expenseCount: number
  submittedDate: Date | null
  status: string
  dueDate: Date
}

interface ReviewReportsListProps {
  reports: Report[]
}

export function ReviewReportsList({
  reports: initialReports,
}: ReviewReportsListProps) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleReview = async (
    reportId: string,
    reportType: "lobbyist" | "employer",
    action: "approve" | "reject" | "request_clarification",
    notes?: string
  ) => {
    setLoadingId(reportId)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, reportType, notes }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process review")
      }

      // Show success message
      setMessage({
        type: "success",
        text: data.message,
      })

      // Remove the reviewed report from the list
      setReports((prev) => prev.filter((r) => r.id !== reportId))

      // Refresh the page data after a short delay
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Error reviewing report:", error)
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to process review",
      })
    } finally {
      setLoadingId(null)
    }
  }

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
      {/* Success/Error Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {reports.map((report) => {
        const isLoading = loadingId === report.id
        const submittedDate = report.submittedDate
          ? new Date(report.submittedDate).toLocaleDateString()
          : "N/A"

        return (
          <div
            key={report.id}
            className={`rounded-lg border bg-white p-6 shadow-sm ${
              isLoading ? "opacity-50 pointer-events-none" : ""
            }`}
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
                Submitted {submittedDate}
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
              <button
                type="button"
                disabled
                className="text-sm font-medium text-gray-400 cursor-not-allowed"
                title="Detailed report view coming soon"
              >
                View Full Report → (Coming Soon)
              </button>
            </div>

            {/* Review Actions */}
            <div className="mt-6 border-t pt-4">
              {isLoading && (
                <div className="mb-4 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Processing...
                  </span>
                </div>
              )}
              <ReviewActions
                entityName={report.submitterName}
                onApprove={() =>
                  handleReview(report.id, report.reportType, "approve")
                }
                onReject={(notes) =>
                  handleReview(report.id, report.reportType, "reject", notes)
                }
                onRequestClarification={(notes) =>
                  handleReview(
                    report.id,
                    report.reportType,
                    "request_clarification",
                    notes
                  )
                }
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
