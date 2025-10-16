import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LobbyistExpenseReportForm } from "@/components/forms/expense-report/LobbyistExpenseReportForm"
import { DemoFilesPanel } from "@/components/DemoFilesPanel"

export default async function LobbyistExpenseReportPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Files Panel - bottom center */}
      <DemoFilesPanel page="lobbyist-expenses" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Quarterly Expense Report
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Report your lobbying expenses for the current quarter. Reports are
            due April 15, July 15, October 15, and January 15.
          </p>
        </div>

        <LobbyistExpenseReportForm userId={session.user.id} />
      </main>
    </div>
  )
}
