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
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });

    // Fetch all lineItems for these reports
    const reportIds = reports.map((r) => r.id);
    const allLineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: { in: reportIds },
        reportType: "LOBBYIST",
      },
      orderBy: {
        date: "desc",
      },
    });

    // Group lineItems by reportId
    const lineItemsByReport = allLineItems.reduce(
      (acc, item) => {
        if (!acc[item.reportId]) acc[item.reportId] = [];
        acc[item.reportId].push(item);
        return acc;
      },
      {} as Record<string, typeof allLineItems>
    );

    // Attach lineItems to each report
    const reportsWithLineItems = reports.map((report) => ({
      ...report,
      lineItems: lineItemsByReport[report.id] || [],
    }));

    return reportsWithLineItems;
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
