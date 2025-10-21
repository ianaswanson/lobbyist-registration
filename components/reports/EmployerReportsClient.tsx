"use client"

import { useState } from "react"
import { EmployerExpenseReport, ExpenseLineItem, EmployerLobbyistPayment, ReportStatus, Lobbyist } from "@prisma/client"
import { Trash2, Edit, Eye } from "lucide-react"

type ReportWithDetails = EmployerExpenseReport & {
  lineItems: ExpenseLineItem[]
  lobbyistPayments: (EmployerLobbyistPayment & {
    lobbyist: Pick<Lobbyist, 'name'>
  })[]
}

interface EmployerReportsClientProps {
  reports: ReportWithDetails[]
}

export function EmployerReportsClient({ reports: initialReports }: EmployerReportsClientProps) {
  const [reports, setReports] = useState(initialReports)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const getStatusBadge = (status: ReportStatus) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      LATE: "bg-red-100 text-red-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      NEEDS_CLARIFICATION: "bg-yellow-100 text-yellow-800",
    }

    return (
      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>
        {status.replace(/_/g, ' ')}
      </span>
    )
  }

  const handleDelete = async (reportId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report? This action cannot be undone."
    )

    if (!confirmed) return

    setLoading(reportId)
    setMessage(null)

    try {
      const response = await fetch(`/api/reports/employer/${reportId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete report")
      }

      // Remove from list
      setReports(reports.filter(r => r.id !== reportId))
      setMessage({ type: 'success', text: 'Report deleted successfully' })
    } catch (error) {
      console.error("Error deleting report:", error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete report'
      })
    } finally {
      setLoading(null)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div>
      {message && (
        <div className={`mb-4 rounded-md p-4 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {reports.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">No expense reports yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by creating your first quarterly expense report.
          </p>
          <a
            href="/reports/employer/new"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Report
          </a>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Quarter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {report.quarter}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {report.year}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(report.totalLobbyingSpend)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {report.lineItems.length}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {report.lobbyistPayments.length}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(report.submittedAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatDate(report.dueDate)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/reports/employer/${report.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                      {report.status === ReportStatus.DRAFT && (
                        <>
                          <a
                            href={`/reports/employer/edit/${report.id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit report"
                          >
                            <Edit className="h-5 w-5" />
                          </a>
                          <button
                            onClick={() => handleDelete(report.id)}
                            disabled={loading === report.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete report"
                          >
                            {loading === report.id ? (
                              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
