"use client"

import { Eye } from "lucide-react"
import { Quarter } from "@prisma/client"

interface QuarterlySubmission {
  quarter: Quarter
  year: number
  calendarEntries: number
  lobbyingReceipts: number
  totalReceiptAmount: number
  hasData: boolean
}

interface BoardMemberReportsClientProps {
  submissions: QuarterlySubmission[]
}

export function BoardMemberReportsClient({ submissions }: BoardMemberReportsClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900">No submissions yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Get started by posting your quarterly calendar and lobbying receipts.
          </p>
          <a
            href="/board-member/calendar"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Calendar & Receipts
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
                  Calendar Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Lobbying Receipts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Receipt Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {submissions.map((submission) => {
                const key = `${submission.year}-${submission.quarter}`
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {submission.quarter}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {submission.year}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {submission.calendarEntries}
                      {submission.calendarEntries === 0 && (
                        <span className="ml-2 text-xs text-gray-400">(none)</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {submission.lobbyingReceipts}
                      {submission.lobbyingReceipts === 0 && (
                        <span className="ml-2 text-xs text-gray-400">(none)</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {submission.lobbyingReceipts > 0 ? (
                        formatCurrency(submission.totalReceiptAmount)
                      ) : (
                        <span className="text-gray-400">$0.00</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/reports/board-member/${submission.year}/${submission.quarter.toLowerCase()}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-blue-900">Ordinance Requirement (§3.001)</h3>
        <p className="mt-1 text-sm text-blue-800">
          Board members must post quarterly calendars and lobbying receipts over $50.
          Data must remain publicly posted for at least 1 year.
        </p>
      </div>
    </div>
  )
}
