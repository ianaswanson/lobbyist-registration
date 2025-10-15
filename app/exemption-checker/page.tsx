import { ExemptionChecker } from "@/components/ExemptionChecker"

export default function ExemptionCheckerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <a href="/" className="text-xl font-bold hover:text-blue-600">
                Lobbyist Registration System
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/auth/signin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Lobbyist Registration Exemption Checker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Determine if you need to register as a lobbyist under Multnomah
            County ordinance (§3.802-§3.803)
          </p>
        </div>

        <ExemptionChecker />
      </main>
    </div>
  )
}
