import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LobbyistReportsClient } from "@/components/reports/LobbyistReportsClient";

async function getReports(userId: string) {
  try {
    // Get lobbyist record
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId },
    });

    if (!lobbyist) {
      return [];
    }

    // Fetch all reports
    const reports = await prisma.lobbyistExpenseReport.findMany({
      where: {
        lobbyistId: lobbyist.id,
      },
      include: {
        lineItems: {
          orderBy: {
            date: "desc",
          },
        },
      },
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });

    return reports;
  } catch (error) {
    console.error("Error fetching lobbyist expense reports:", error);
    return [];
  }
}

export default async function LobbyistReportsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "LOBBYIST") {
    redirect("/auth/signin");
  }

  const reports = await getReports(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Expense Reports
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View, edit, and manage your quarterly expense reports
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/reports/lobbyist/new"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                New Report
              </a>
              <a
                href="/dashboard"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        <LobbyistReportsClient reports={reports} />
      </main>
    </div>
  );
}
