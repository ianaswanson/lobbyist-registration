import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SkipLink } from "@/components/SkipLink"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  async function handleSignOut() {
    "use server"
    await signOut({ redirectTo: "/" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <nav className="border-b bg-white" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">
                Lobbyist Registration System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {session.user?.role}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600">
            Authentication is working! You are signed in as {session.user?.role}.
          </p>

          <div className="mt-6 rounded-md bg-green-50 p-4">
            <h3 className="text-sm font-medium text-green-800">
              ✅ NextAuth.js Setup Complete
            </h3>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• Credentials provider configured</li>
              <li>• JWT session strategy enabled</li>
              <li>• Role-based access control ready</li>
              <li>• Protected routes middleware active</li>
            </ul>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Exemption Checker - Available to all roles */}
              <a
                href="/exemption-checker"
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-green-500 hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Check if you need to register as a lobbyist"
              >
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Exemption Checker
                  </h4>
                  <p className="text-sm text-gray-600">
                    Check if you need to register
                  </p>
                </div>
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>

              {(session.user?.role === "LOBBYIST" || session.user?.role === "ADMIN") && (
                <>
                  <a
                    href="/register/lobbyist"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Register as a lobbyist"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Lobbyist Registration
                      </h4>
                      <p className="text-sm text-gray-600">
                        Register as a lobbyist
                      </p>
                    </div>
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  <a
                    href="/reports/lobbyist"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Submit lobbyist expense report"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Lobbyist Expense Report
                      </h4>
                      <p className="text-sm text-gray-600">
                        Submit lobbying expenses
                      </p>
                    </div>
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </>
              )}

              {(session.user?.role === "EMPLOYER" || session.user?.role === "ADMIN") && (
                <a
                  href="/reports/employer"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-orange-500 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  aria-label="Submit employer expense report"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Employer Expense Report
                    </h4>
                    <p className="text-sm text-gray-600">
                      Report lobbying expenditures
                    </p>
                  </div>
                  <svg
                    className="h-6 w-6 text-orange-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}

              {(session.user?.role === "BOARD_MEMBER" || session.user?.role === "ADMIN") && (
                <a
                  href="/board-member/calendar"
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-500 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  aria-label="Post calendar and lobbying receipts"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Calendar & Receipts
                    </h4>
                    <p className="text-sm text-gray-600">
                      Post calendar and lobbying receipts
                    </p>
                  </div>
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              )}

              {session.user?.role === "ADMIN" && (
                <>
                  <a
                    href="/admin/compliance"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="View compliance dashboard"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Compliance Dashboard
                      </h4>
                      <p className="text-sm text-gray-600">
                        Monitor compliance and alerts
                      </p>
                    </div>
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                  <a
                    href="/admin/notifications"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-yellow-500 hover:bg-yellow-50 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    aria-label="Manage email notifications"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600">
                        Manage automated reminders
                      </p>
                    </div>
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
