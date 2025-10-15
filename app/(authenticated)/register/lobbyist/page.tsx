import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LobbyistRegistrationWizard } from "@/components/forms/LobbyistRegistrationWizard"

export default async function LobbyistRegistrationPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user already has a lobbyist profile
  // TODO: Check database if lobbyist exists for this user

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
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
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Lobbyist Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete this form to register as a lobbyist with Multnomah County.
            Registration is required within 3 working days after exceeding 10
            hours of lobbying activity per quarter.
          </p>
        </div>

        <LobbyistRegistrationWizard userId={session.user.id} />
      </main>
    </div>
  )
}
