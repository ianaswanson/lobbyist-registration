import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LobbyistExpenseReportForm } from "@/components/forms/expense-report/LobbyistExpenseReportForm"

export default async function LobbyistExpenseReportPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold hover:text-blue-600">
                Lobbyist Registration System
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {session.user?.role}
              </span>
            </div>
          </div>
        </div>
      </nav>

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
