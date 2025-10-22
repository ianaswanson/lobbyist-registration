import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReviewReportsList } from "@/components/admin/ReviewReportsList";
import { prisma } from "@/lib/db";
import { ReportStatus } from "@prisma/client";

async function getPendingReports() {
  try {
    // Fetch lobbyist reports
    const lobbyistReports = await prisma.lobbyistExpenseReport.findMany({
      where: {
        status: {
          in: [ReportStatus.SUBMITTED, ReportStatus.LATE],
        },
      },
      include: {
        lobbyist: {
          select: {
            name: true,
            email: true,
          },
        },
        lineItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        submittedAt: "asc", // Oldest first
      },
    });

    // Fetch employer reports
    const employerReports = await prisma.employerExpenseReport.findMany({
      where: {
        status: {
          in: [ReportStatus.SUBMITTED, ReportStatus.LATE],
        },
      },
      include: {
        employer: {
          select: {
            name: true,
            email: true,
          },
        },
        lineItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        submittedAt: "asc", // Oldest first
      },
    });

    // Combine and format reports
    const allReports = [
      ...lobbyistReports.map((report) => ({
        id: report.id,
        type: "Lobbyist Expense Report" as const,
        reportType: "lobbyist" as const,
        submitterName: report.lobbyist.name,
        submitterEmail: report.lobbyist.email,
        quarter: report.quarter,
        year: report.year,
        totalAmount: report.totalFoodEntertainment,
        expenseCount: report.lineItems.length,
        submittedDate: report.submittedAt,
        status: report.status,
        dueDate: report.dueDate,
      })),
      ...employerReports.map((report) => ({
        id: report.id,
        type: "Employer Expense Report" as const,
        reportType: "employer" as const,
        submitterName: report.employer.name,
        submitterEmail: report.employer.email,
        quarter: report.quarter,
        year: report.year,
        totalAmount: report.totalLobbyingSpend,
        expenseCount: report.lineItems.length,
        submittedDate: report.submittedAt,
        status: report.status,
        dueDate: report.dueDate,
      })),
    ];

    // Sort by submitted date
    allReports.sort((a, b) => {
      if (!a.submittedDate || !b.submittedDate) return 0;
      return a.submittedDate.getTime() - b.submittedDate.getTime();
    });

    return allReports;
  } catch (error) {
    console.error("Error fetching pending reports:", error);
    return [];
  }
}

export default async function AdminReviewReportsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const reports = await getPendingReports();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Expense Reports
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and approve or reject pending expense reports
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

        <ReviewReportsList reports={reports} />
      </main>
    </div>
  );
}
