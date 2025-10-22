import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LobbyistExpenseReportForm } from "@/components/forms/expense-report/LobbyistExpenseReportForm";
import { DemoFilesPanel } from "@/components/DemoFilesPanel";

async function getReport(userId: string, reportId: string) {
  try {
    // Get lobbyist record
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId },
    });

    if (!lobbyist) {
      return null;
    }

    // Fetch the specific report
    const report = await prisma.lobbyistExpenseReport.findUnique({
      where: { id: reportId },
    });

    // Verify this report belongs to this lobbyist
    if (!report || report.lobbyistId !== lobbyist.id) {
      return null;
    }

    // Fetch lineItems separately
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: "LOBBYIST",
      },
    });

    return { ...report, lineItems };
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}

export default async function EditLobbyistReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const report = await getReport(session.user.id, id);

  if (!report) {
    redirect("/reports/lobbyist");
  }

  // Can only edit drafts
  if (report.status !== "DRAFT") {
    redirect("/reports/lobbyist");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoFilesPanel page="lobbyist-expenses" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Quarterly Expense Report
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Editing {report.quarter} {report.year} expense report (Draft)
          </p>
        </div>

        <LobbyistExpenseReportForm
          userId={session.user.id}
          initialQuarter={report.quarter}
          initialYear={report.year}
        />
      </main>
    </div>
  );
}
