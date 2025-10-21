import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { BoardMemberReportsClient } from "@/components/reports/BoardMemberReportsClient"
import { Quarter } from "@prisma/client"

// Aggregate data by quarter/year for board member submissions
interface QuarterlySubmission {
  quarter: Quarter
  year: number
  calendarEntries: number
  lobbyingReceipts: number
  totalReceiptAmount: number
  hasData: boolean
}

async function getSubmissions(userId: string): Promise<QuarterlySubmission[]> {
  try {
    // Get board member record
    const boardMember = await prisma.boardMember.findUnique({
      where: { userId },
      include: {
        calendarEntries: {
          orderBy: [
            { year: "desc" },
            { quarter: "desc" },
          ],
        },
        lobbyingReceipts: {
          orderBy: [
            { year: "desc" },
            { quarter: "desc" },
          ],
        },
      },
    })

    if (!boardMember) {
      return []
    }

    // Aggregate by quarter/year
    const submissionsByQuarter = new Map<string, QuarterlySubmission>()

    // Process calendar entries
    boardMember.calendarEntries.forEach((entry) => {
      const key = `${entry.year}-Q${entry.quarter}`
      if (!submissionsByQuarter.has(key)) {
        submissionsByQuarter.set(key, {
          quarter: entry.quarter,
          year: entry.year,
          calendarEntries: 0,
          lobbyingReceipts: 0,
          totalReceiptAmount: 0,
          hasData: false,
        })
      }
      const submission = submissionsByQuarter.get(key)!
      submission.calendarEntries++
      submission.hasData = true
    })

    // Process lobbying receipts
    boardMember.lobbyingReceipts.forEach((receipt) => {
      const key = `${receipt.year}-Q${receipt.quarter}`
      if (!submissionsByQuarter.has(key)) {
        submissionsByQuarter.set(key, {
          quarter: receipt.quarter,
          year: receipt.year,
          calendarEntries: 0,
          lobbyingReceipts: 0,
          totalReceiptAmount: 0,
          hasData: false,
        })
      }
      const submission = submissionsByQuarter.get(key)!
      submission.lobbyingReceipts++
      submission.totalReceiptAmount += receipt.amount
      submission.hasData = true
    })

    // Convert to array and sort by year/quarter descending
    const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 }
    const submissions = Array.from(submissionsByQuarter.values())
      .filter(s => s.hasData)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year
        return quarterOrder[b.quarter] - quarterOrder[a.quarter]
      })

    return submissions
  } catch (error) {
    console.error("Error fetching board member submissions:", error)
    return []
  }
}

export default async function BoardMemberReportsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "BOARD_MEMBER") {
    redirect("/auth/signin")
  }

  const submissions = await getSubmissions(session.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Quarterly Submissions
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View your calendar entries and lobbying receipts by quarter
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/board-member/calendar"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Calendar & Receipts
              </a>
              <a
                href="/dashboard"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        <BoardMemberReportsClient submissions={submissions} />
      </main>
    </div>
  )
}
