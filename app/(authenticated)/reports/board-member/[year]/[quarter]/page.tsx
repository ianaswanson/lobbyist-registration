import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Quarter } from "@prisma/client"

interface PageProps {
  params: Promise<{
    year: string
    quarter: string
  }>
}

async function getQuarterData(userId: string, year: number, quarter: Quarter) {
  try {
    // Get board member record
    const boardMember = await prisma.boardMember.findUnique({
      where: { userId },
      include: {
        calendarEntries: {
          where: {
            year,
            quarter,
          },
          orderBy: {
            eventDate: "desc",
          },
        },
        lobbyingReceipts: {
          where: {
            year,
            quarter,
          },
          include: {
            lobbyist: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!boardMember) {
      return null
    }

    return boardMember
  } catch (error) {
    console.error("Error fetching board member quarter data:", error)
    return null
  }
}

export default async function BoardMemberQuarterDetailPage({ params }: PageProps) {
  const session = await auth()
  const resolvedParams = await params

  if (!session || session.user?.role !== "BOARD_MEMBER") {
    redirect("/auth/signin")
  }

  const year = parseInt(resolvedParams.year)
  const quarterParam = resolvedParams.quarter.toUpperCase() as Quarter

  // Validate quarter
  if (isNaN(year) || !['Q1', 'Q2', 'Q3', 'Q4'].includes(quarterParam)) {
    notFound()
  }

  const data = await getQuarterData(session.user.id, year, quarterParam)

  if (!data || (data.calendarEntries.length === 0 && data.lobbyingReceipts.length === 0)) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const totalReceiptAmount = data.lobbyingReceipts.reduce((sum, receipt) => sum + receipt.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/reports/board-member"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {quarterParam} {year} Submissions
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {data.name} - {data.district || 'Board Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Calendar Events</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.calendarEntries.length}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Lobbying Receipts</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.lobbyingReceipts.length}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Receipt Amount</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{formatCurrency(totalReceiptAmount)}</dd>
            </div>
          </div>
        </div>

        {/* Calendar Entries */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Calendar Events
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Public meetings and events with lobbyists (§3.001)
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {data.calendarEntries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No calendar events for this quarter</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Title
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participants
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.calendarEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(entry.eventDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.eventTime || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {entry.eventTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {entry.participantsList}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lobbying Receipts */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Lobbying Receipts (over $50)
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Food, entertainment, and other expenses with lobbyists
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {data.lobbyingReceipts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No lobbying receipts for this quarter</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lobbyist
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payee
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.lobbyingReceipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(receipt.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.lobbyist?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {receipt.payee}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {receipt.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {formatCurrency(receipt.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        Total:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(totalReceiptAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Public Posting Note */}
        <div className="bg-blue-50 border border-blue-200 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900">Public Transparency (§3.001)</h3>
          <p className="text-sm text-blue-800 mt-2">
            This information is publicly posted on the county website and maintained for a minimum of one year
            to ensure transparency in board member interactions with lobbyists.
          </p>
        </div>
      </main>
    </div>
  )
}
