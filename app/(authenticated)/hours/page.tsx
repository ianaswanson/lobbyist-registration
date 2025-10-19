import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { HourTrackerDashboard } from "@/components/hours/HourTrackerDashboard"
import { FEATURE_FLAGS } from "@/lib/feature-flags"

export default async function HourTrackingPage() {
  // Check if feature is enabled
  if (!FEATURE_FLAGS.HOUR_TRACKING) {
    notFound()
  }

  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Only lobbyists can access this page
  if (session.user.role !== "LOBBYIST") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Hour Tracking
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your lobbying hours to stay compliant with registration requirements.
            You must register within 3 working days after exceeding 10 hours in a quarter.
          </p>
        </div>

        <HourTrackerDashboard userId={session.user.id} />
      </main>
    </div>
  )
}
