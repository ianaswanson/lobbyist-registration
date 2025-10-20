import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SkipLink } from "@/components/SkipLink"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipLink />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user?.name || session.user?.email?.split("@")[0]}
          </h2>
          <p className="mt-2 text-gray-600">
            {session.user?.role === "LOBBYIST" && "Manage your lobbyist registration and quarterly expense reports."}
            {session.user?.role === "EMPLOYER" && "Track and report your organization's lobbying expenditures."}
            {session.user?.role === "BOARD_MEMBER" && "Post your calendar and lobbying receipts for public transparency."}
            {session.user?.role === "ADMIN" && "Monitor compliance, review registrations, and manage the system."}
            {session.user?.role === "PUBLIC" && "Search and view public lobbying records."}
          </p>
        </div>

        {/* Important Reminders */}
        {(session.user?.role === "LOBBYIST" || session.user?.role === "EMPLOYER") && (
          <div className="mb-8 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Upcoming Deadlines</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Quarterly expense reports are due: <strong>January 15, April 15, July 15, and October 15</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {session.user?.role === "LOBBYIST" && (
                <>
                  {FEATURE_FLAGS.HOUR_TRACKING && (
                    <a
                      href="/hours"
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Track lobbying hours"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Hour Tracking
                        </h4>
                        <p className="text-sm text-gray-600">
                          Log your lobbying hours
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
                  )}
                  <a
                    href="/reports/lobbyist"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-purple-500 hover:bg-purple-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Submit lobbyist expense report"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Quarterly Reports
                      </h4>
                      <p className="text-sm text-gray-600">
                        Submit expense reports
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
                  <a
                    href="/my-violations"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-orange-500 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label="View violations and appeals"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        My Violations
                      </h4>
                      <p className="text-sm text-gray-600">
                        View violations and appeals
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
                </>
              )}

              {session.user?.role === "EMPLOYER" && (
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

              {session.user?.role === "BOARD_MEMBER" && (
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
                    href="/admin/violations"
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-orange-500 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label="Track violations and issue fines"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Violations & Fines
                      </h4>
                      <p className="text-sm text-gray-600">
                        Issue violations and track appeals
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

        {/* Help & Resources */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Help & Resources
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">Need help?</strong>
              <p>Contact the Multnomah County Lobbying Registration Office for assistance.</p>
            </div>
            <div>
              <strong className="text-gray-900">Ordinance Reference:</strong>
              <p>View the complete <a href="/ordinance" className="text-blue-600 hover:underline">Government Accountability Ordinance</a> (effective July 1, 2026)</p>
            </div>
            <div>
              <strong className="text-gray-900">Public Records:</strong>
              <p>All lobbyist registrations and expense reports are <a href="/search" className="text-blue-600 hover:underline">publicly searchable</a> for transparency.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
