import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReviewRegistrationsList } from "@/components/admin/ReviewRegistrationsList"

export default async function AdminReviewRegistrationsPage() {
  const session = await auth()

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  // Mock data for pending registrations
  const pendingRegistrations = [
    {
      id: "reg-001",
      lobbyistName: "Sarah Johnson",
      lobbyistEmail: "sarah.johnson@example.com",
      employerName: "Tech Solutions LLC",
      subjectsOfInterest: "Technology policy, data privacy, cybersecurity",
      submittedDate: "2025-10-10",
      hoursCurrentQuarter: 15,
      hasAuthorizationDoc: true,
    },
    {
      id: "reg-002",
      lobbyistName: "Michael Chen",
      lobbyistEmail: "mchen@advocacy.org",
      employerName: "Community Advocacy Group",
      subjectsOfInterest: "Housing, homelessness services, affordable housing",
      submittedDate: "2025-10-12",
      hoursCurrentQuarter: 22,
      hasAuthorizationDoc: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/dashboard" className="text-xl font-bold">
                Lobbyist Registration System
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name || session.user?.email}
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                {session.user?.role}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Lobbyist Registrations
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and approve or reject pending lobbyist registrations
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

        <ReviewRegistrationsList registrations={pendingRegistrations} />
      </main>
    </div>
  )
}
