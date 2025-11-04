import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Quarter, ReportStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Helper function to get quarter deadlines
function getQuarterDeadline(quarter: Quarter, year: number): Date {
  const deadlines = {
    Q1: new Date(year, 3, 15), // April 15
    Q2: new Date(year, 6, 15), // July 15
    Q3: new Date(year, 9, 15), // October 15
    Q4: new Date(year + 1, 0, 15), // January 15 (next year)
  };
  return deadlines[quarter];
}

// Helper to get quarter label
function getQuarterLabel(quarter: Quarter, year: number): string {
  return `${quarter} ${year}`;
}

/**
 * GET /api/public/analytics
 * Returns aggregated data for public transparency charts
 * Query params:
 * - timeRange: 'ytd' | 'last_year' | 'all_time' (default: 'all_time')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "all_time";

    // Calculate date filters based on time range
    const now = new Date();
    const currentYear = now.getFullYear();
    let startDate: Date | undefined;

    if (timeRange === "ytd") {
      startDate = new Date(currentYear, 0, 1); // Jan 1 of current year
    } else if (timeRange === "last_year") {
      startDate = new Date(currentYear - 1, 0, 1); // Jan 1 of last year
    }
    // 'all_time' has no date filter

    // =========================================================================
    // 1. QUARTERLY LOBBYING EXPENSES (Line Chart)
    // =========================================================================
    const allLobbyistReports = await prisma.lobbyistExpenseReport.findMany({
      where: {
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
        ...(startDate && { submittedAt: { gte: startDate } }),
      },
      select: {
        quarter: true,
        year: true,
        totalFoodEntertainment: true,
      },
    });

    const allEmployerReports = await prisma.employerExpenseReport.findMany({
      where: {
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
        ...(startDate && { submittedAt: { gte: startDate } }),
      },
      select: {
        quarter: true,
        year: true,
        totalLobbyingSpend: true,
      },
    });

    // Get all expense line items to calculate total expenses per quarter
    const allLineItems = await prisma.expenseLineItem.findMany({
      where: {
        ...(startDate && { date: { gte: startDate } }),
      },
      select: {
        amount: true,
        date: true,
        reportId: true,
        reportType: true,
      },
    });

    // Group expenses by quarter
    const quarterlyExpenses: Record<string, number> = {};
    allLineItems.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      // Determine quarter based on month (0-indexed)
      let quarter: Quarter;
      if (month >= 0 && month <= 2) quarter = Quarter.Q1;
      else if (month >= 3 && month <= 5) quarter = Quarter.Q2;
      else if (month >= 6 && month <= 8) quarter = Quarter.Q3;
      else quarter = Quarter.Q4;

      const label = getQuarterLabel(quarter, year);
      quarterlyExpenses[label] = (quarterlyExpenses[label] || 0) + item.amount;
    });

    // Convert to array and sort chronologically
    const quarterlyExpensesData = Object.entries(quarterlyExpenses)
      .map(([label, total]) => ({
        quarter: label,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => {
        const [qA, yA] = a.quarter.split(" ");
        const [qB, yB] = b.quarter.split(" ");
        if (yA !== yB) return parseInt(yA) - parseInt(yB);
        const qOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
        return (qOrder[qA as Quarter] || 0) - (qOrder[qB as Quarter] || 0);
      });

    // =========================================================================
    // 2. TOP 10 LOBBYIST EMPLOYERS (Horizontal Bar Chart)
    // =========================================================================
    const employerSpending = await prisma.employerExpenseReport.findMany({
      where: {
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
        ...(startDate && { submittedAt: { gte: startDate } }),
      },
      include: {
        employer: {
          select: {
            name: true,
          },
        },
      },
    });

    const employerTotals: Record<string, { name: string; total: number }> = {};
    employerSpending.forEach((report) => {
      const employerName = report.employer.name;
      if (!employerTotals[employerName]) {
        employerTotals[employerName] = { name: employerName, total: 0 };
      }
      employerTotals[employerName].total += report.totalLobbyingSpend;
    });

    const topEmployers = Object.values(employerTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((employer) => ({
        name: employer.name,
        total: Math.round(employer.total * 100) / 100,
      }));

    // =========================================================================
    // 3. LOBBYIST REGISTRATION GROWTH (Line Chart)
    // =========================================================================
    const allLobbyists = await prisma.lobbyist.findMany({
      where: {
        status: "APPROVED",
        ...(startDate && { registrationDate: { gte: startDate } }),
      },
      select: {
        registrationDate: true,
      },
      orderBy: {
        registrationDate: "asc",
      },
    });

    // Group by month for registration growth
    const monthlyRegistrations: Record<string, number> = {};
    let cumulativeCount = 0;

    allLobbyists.forEach((lobbyist) => {
      const date = new Date(lobbyist.registrationDate);
      const monthLabel = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      cumulativeCount++;
      monthlyRegistrations[monthLabel] = cumulativeCount;
    });

    const registrationGrowthData = Object.entries(monthlyRegistrations).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    // =========================================================================
    // 4. EXPENSE REPORT COMPLIANCE RATE (Donut Chart)
    // =========================================================================
    const allReports = await prisma.$transaction([
      prisma.lobbyistExpenseReport.findMany({
        where: {
          status: {
            not: ReportStatus.DRAFT,
          },
          ...(startDate && { submittedAt: { gte: startDate } }),
        },
        select: {
          status: true,
          submittedAt: true,
          dueDate: true,
        },
      }),
      prisma.employerExpenseReport.findMany({
        where: {
          status: {
            not: ReportStatus.DRAFT,
          },
          ...(startDate && { submittedAt: { gte: startDate } }),
        },
        select: {
          status: true,
          submittedAt: true,
          dueDate: true,
        },
      }),
    ]);

    const [lobbyistReports, employerReports] = allReports;
    const combinedReports = [...lobbyistReports, ...employerReports];

    let onTimeCount = 0;
    let lateCount = 0;

    combinedReports.forEach((report) => {
      if (report.status === ReportStatus.LATE) {
        lateCount++;
      } else if (
        report.status === ReportStatus.SUBMITTED ||
        report.status === ReportStatus.APPROVED
      ) {
        // Check if submitted before due date
        if (report.submittedAt && report.submittedAt <= report.dueDate) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      }
    });

    const totalReports = onTimeCount + lateCount;
    const complianceRate =
      totalReports > 0 ? Math.round((onTimeCount / totalReports) * 100) : 0;

    const complianceData = {
      onTime: onTimeCount,
      late: lateCount,
      rate: complianceRate,
    };

    // =========================================================================
    // 5. SUMMARY STATISTICS
    // =========================================================================
    const [
      totalLobbyists,
      totalEmployers,
      totalReportsCount,
      totalExpenses,
    ] = await prisma.$transaction([
      prisma.lobbyist.count({
        where: {
          status: "APPROVED",
          ...(startDate && { registrationDate: { gte: startDate } }),
        },
      }),
      prisma.employer.count(),
      prisma.lobbyistExpenseReport.count({
        where: {
          status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
          ...(startDate && { submittedAt: { gte: startDate } }),
        },
      }),
      prisma.expenseLineItem.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          ...(startDate && { date: { gte: startDate } }),
        },
      }),
    ]);

    const summaryStats = {
      totalLobbyists,
      totalEmployers,
      totalReports: totalReportsCount,
      totalExpenses: Math.round((totalExpenses._sum.amount || 0) * 100) / 100,
      timeRange,
    };

    // =========================================================================
    // RETURN ALL DATA
    // =========================================================================
    const analyticsData = {
      quarterlyExpenses: quarterlyExpensesData,
      topEmployers,
      registrationGrowth: registrationGrowthData,
      compliance: complianceData,
      summary: summaryStats,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json(
      { error: "Failed to generate analytics data" },
      { status: 500 }
    );
  }
}
