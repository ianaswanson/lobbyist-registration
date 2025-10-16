import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReviewReportsList } from "@/components/admin/ReviewReportsList"

export default async function AdminReviewReportsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  // Mock data for pending reports
  const pendingReports = [
    {
      id: "report-001",
      type: "Lobbyist Expense Report",
      submitterName: "John Smith",
      submitterEmail: "jsmith@example.com",
      quarter: "Q3",
      year: 2025,
      totalAmount: 1250.5,
      expenseCount: 8,
      submittedDate: "2025-10-13",
      hasDocuments: true,
    },
    {
      id: "report-002",
      type: "Employer Expense Report",
      submitterName: "Acme Corporation",
      submitterEmail: "contact@acme.com",
      quarter: "Q3",
      year: 2025,
      totalAmount: 8500.0,
      expenseCount: 15,
      submittedDate: "2025-10-14",
      hasDocuments: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Expense Reports
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and approve or reject pending expense reports
              </p>
            </div>
            <a
              href="/admin/compliance"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </a>
          </div>
        </div>

        <ReviewReportsList reports={pendingReports} />
      </main>
    </div>
  )
}
