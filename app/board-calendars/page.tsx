import { BoardCalendarsClient } from "./BoardCalendarsClient";
import { PublicNavigation } from "@/components/PublicNavigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Board Member Calendars | Lobbyist Registry",
  description:
    "View quarterly calendars and lobbying receipts for Multnomah County Board Members (§3.001)",
};

export default async function BoardCalendarsPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavigation user={session?.user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Board Member Calendars
          </h1>
          <p className="mt-2 text-gray-600">
            View quarterly calendars and lobbying receipts for county board
            members
          </p>
          <div className="mt-4 rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Ordinance Requirement (§3.001):</strong> Board members
              must post quarterly calendars and report any lobbying expenditures
              exceeding $50. Records are publicly available for at least 1 year.
            </p>
          </div>
        </div>

        <BoardCalendarsClient />
      </main>
    </div>
  );
}
