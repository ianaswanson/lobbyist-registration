import { ExemptionChecker } from "@/components/ExemptionChecker";
import { PublicNavigation } from "@/components/PublicNavigation";
import { auth } from "@/lib/auth";

export default async function ExemptionCheckerPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation user={session?.user} />

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
  );
}
