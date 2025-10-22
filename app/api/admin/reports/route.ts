import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ReportStatus } from "@prisma/client";

/**
 * GET /api/admin/reports
 * Get all pending expense reports for admin review
 */
export async function GET(req: Request) {
  try {
    // 1. Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "SUBMITTED";
    const reportType = searchParams.get("type"); // "lobbyist", "employer", or null for both

    // 3. Fetch reports
    const lobbyistReports =
      reportType !== "employer"
        ? await prisma.lobbyistExpenseReport.findMany({
            where: {
              status: {
                in:
                  status === "SUBMITTED"
                    ? [ReportStatus.SUBMITTED, ReportStatus.LATE]
                    : [status as ReportStatus],
              },
            },
            include: {
              lobbyist: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              submittedAt: "asc", // Oldest first
            },
          })
        : [];

    const employerReports =
      reportType !== "lobbyist"
        ? await prisma.employerExpenseReport.findMany({
            where: {
              status: {
                in:
                  status === "SUBMITTED"
                    ? [ReportStatus.SUBMITTED, ReportStatus.LATE]
                    : [status as ReportStatus],
              },
            },
            include: {
              employer: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              submittedAt: "asc", // Oldest first
            },
          })
        : [];

    // Fetch lineItem counts
    const lobbyistReportIds = lobbyistReports.map((r) => r.id);
    const employerReportIds = employerReports.map((r) => r.id);

    const lobbyistCounts = await prisma.expenseLineItem.groupBy({
      by: ["reportId"],
      where: {
        reportId: { in: lobbyistReportIds },
        reportType: "LOBBYIST",
      },
      _count: true,
    });

    const employerCounts = await prisma.expenseLineItem.groupBy({
      by: ["reportId"],
      where: {
        reportId: { in: employerReportIds },
        reportType: "EMPLOYER",
      },
      _count: true,
    });

    const countByReportId = new Map([
      ...lobbyistCounts.map((c) => [c.reportId, c._count]),
      ...employerCounts.map((c) => [c.reportId, c._count]),
    ]);

    // 4. Combine and format reports
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
        expenseCount: countByReportId.get(report.id) || 0,
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
        expenseCount: countByReportId.get(report.id) || 0,
        submittedDate: report.submittedAt,
        status: report.status,
        dueDate: report.dueDate,
      })),
    ];

    // 5. Sort by submitted date
    allReports.sort((a, b) => {
      if (!a.submittedDate || !b.submittedDate) return 0;
      return a.submittedDate.getTime() - b.submittedDate.getTime();
    });

    // 6. Return reports
    return NextResponse.json({
      reports: allReports,
      count: allReports.length,
    });
  } catch (error) {
    console.error("Error fetching expense reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
