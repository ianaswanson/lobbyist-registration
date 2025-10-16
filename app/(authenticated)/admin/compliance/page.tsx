import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// Mock data for demonstration
const complianceData = {
  totalLobbyists: 48,
  totalEmployers: 23,
  totalBoardMembers: 5,
  upcomingDeadline: {
    type: "Q1 Reports",
    date: "2025-04-15",
    daysUntil: 12,
  },
  overdueReports: [
    {
      id: "1",
      type: "Lobbyist Expense Report",
      entity: "Jane Smith",
      quarter: "Q4 2024",
      dueDate: "2025-01-15",
      daysOverdue: 90,
    },
    {
      id: "2",
      type: "Employer Expense Report",
      entity: "Tech Industry Association",
      quarter: "Q4 2024",
      dueDate: "2025-01-15",
      daysOverdue: 90,
    },
  ],
  recentRegistrations: [
    {
      id: "1",
      lobbyistName: "John Doe",
      employer: "Downtown Business Coalition",
      date: "2025-10-10",
      status: "Pending Review",
    },
    {
      id: "2",
      lobbyistName: "Sarah Johnson",
      employer: "Environmental Alliance",
      date: "2025-10-12",
      status: "Pending Review",
    },
  ],
  violations: [
    {
      id: "1",
      entity: "ABC Consulting",
      type: "Late Report Submission",
      date: "2025-10-01",
      fineAmount: 500,
      status: "Issued",
    },
  ],
}

export default async function AdminComplianceDashboardPage() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const today = new Date()
  const upcomingDate = new Date(complianceData.upcomingDeadline.date)

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Compliance Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor registrations, deadlines, and compliance status
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Registered Lobbyists
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {complianceData.totalLobbyists}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Employers</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {complianceData.totalEmployers}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Board Members
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {complianceData.totalBoardMembers}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <svg
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Violations</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {complianceData.violations.length}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Upcoming Deadline */}
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-yellow-900">
                  Upcoming Deadline
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    <strong>{complianceData.upcomingDeadline.type}</strong> due{" "}
                    {upcomingDate.toLocaleDateString()}
                  </p>
                  <p className="mt-1">
                    {complianceData.upcomingDeadline.daysUntil} days remaining
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Reports */}
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-900">
                  Overdue Reports
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    <strong>{complianceData.overdueReports.length}</strong>{" "}
                    reports overdue
                  </p>
                  <p className="mt-1">Action required</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Registrations */}
        <div className="rounded-lg border bg-white shadow-sm mb-8">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Registrations ({complianceData.recentRegistrations.length})
            </h2>
            <a
              href="/admin/review/registrations"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All →
            </a>
          </div>
          <div className="divide-y">
            {complianceData.recentRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {registration.lobbyistName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Employer: {registration.employer}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Submitted: {new Date(registration.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                    {registration.status}
                  </span>
                  <a
                    href="/admin/review/registrations"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Review
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reports for Review */}
        <div className="rounded-lg border bg-white shadow-sm mb-8">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Reports for Review
            </h2>
            <a
              href="/admin/review/reports"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All →
            </a>
          </div>
          <div className="p-6 text-center text-sm text-gray-600">
            <p>2 expense reports awaiting review</p>
            <a
              href="/admin/review/reports"
              className="mt-2 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Review Reports
            </a>
          </div>
        </div>

        {/* Overdue Reports Table */}
        <div className="rounded-lg border bg-white shadow-sm mb-8">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Overdue Reports
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Days Overdue
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {complianceData.overdueReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {report.entity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {report.type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {report.quarter}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(report.dueDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        {report.daysOverdue} days
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        disabled
                        title="Send reminder workflow coming soon"
                      >
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Violations */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Violations
            </h2>
          </div>
          <div className="divide-y">
            {complianceData.violations.map((violation) => (
              <div
                key={violation.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {violation.entity}
                  </h3>
                  <p className="text-sm text-gray-600">{violation.type}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Issued: {new Date(violation.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${violation.fineAmount.toFixed(2)}
                    </p>
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                      {violation.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
