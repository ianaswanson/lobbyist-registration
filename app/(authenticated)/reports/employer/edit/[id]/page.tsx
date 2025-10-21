import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { EmployerExpenseReportForm } from "@/components/forms/expense-report/EmployerExpenseReportForm"
import { DemoFilesPanel } from "@/components/DemoFilesPanel"

async function getReport(userId: string, reportId: string) {
  try {
    // Get employer record
    const employer = await prisma.employer.findUnique({
      where: { userId },
    })

    if (!employer) {
      return null
    }

    // Fetch the specific report
    const report = await prisma.employerExpenseReport.findUnique({
      where: { id: reportId },
      include: {
        lineItems: true,
        lobbyistPayments: {
          include: {
            lobbyist: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    // Verify this report belongs to this employer
    if (report && report.employerId !== employer.id) {
      return null
    }

    return report
  } catch (error) {
    console.error("Error fetching report:", error)
    return null
  }
}

export default async function EditEmployerReportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  const report = await getReport(session.user.id, id)

  if (!report) {
    redirect("/reports/employer")
  }

  // Can only edit drafts
  if (report.status !== "DRAFT") {
    redirect("/reports/employer")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoFilesPanel page="employer-expenses" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Quarterly Expense Report
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Editing {report.quarter} {report.year} expense report (Draft)
          </p>
        </div>

        <EmployerExpenseReportForm
          userId={session.user.id}
          initialQuarter={report.quarter}
          initialYear={report.year}
        />
      </main>
    </div>
  )
}
