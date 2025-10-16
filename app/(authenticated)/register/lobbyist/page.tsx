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
