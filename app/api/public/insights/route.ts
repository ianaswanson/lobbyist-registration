import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Quarter, ReportStatus, RegistrationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Helper to get date range based on year and quarter filters
function getDateRange(year: string | null, quarter: string | null) {
  if (!year || year === "all") {
    return { startDate: undefined, endDate: undefined };
  }

  const yearNum = parseInt(year);

  if (!quarter || quarter === "all") {
    // Full year
    return {
      startDate: new Date(yearNum, 0, 1),
      endDate: new Date(yearNum, 11, 31, 23, 59, 59),
    };
  }

  // Specific quarter
  const quarterMap: Record<string, { start: number; end: number }> = {
    Q1: { start: 0, end: 2 },
    Q2: { start: 3, end: 5 },
    Q3: { start: 6, end: 8 },
    Q4: { start: 9, end: 11 },
  };

  const { start, end } = quarterMap[quarter];
  return {
    startDate: new Date(yearNum, start, 1),
    endDate: new Date(yearNum, end + 1, 0, 23, 59, 59),
  };
}

/**
 * GET /api/public/insights
 * Returns pre-built insights and metrics for lobbying data
 * Query params:
 * - year: 'all' | '2024' | '2025' (default: 'all')
 * - quarter: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4' (default: 'all')
 * - entityType: 'all' | 'lobbyist' | 'employer' (default: 'all')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year") || "all";
    const quarter = searchParams.get("quarter") || "all";
    const entityType = searchParams.get("entityType") || "all";

    const { startDate, endDate } = getDateRange(year, quarter);

    // Build date filter for queries
    const dateFilter = startDate && endDate
      ? { gte: startDate, lte: endDate }
      : undefined;

    // =========================================================================
    // 1. REGISTRATION SUMMARY
    // =========================================================================

    const [
      totalLobbyists,
      activeLobbyists,
      inactiveLobbyists,
      pendingLobbyists,
      previousPeriodLobbyists,
    ] = await Promise.all([
      // Total approved lobbyists
      prisma.lobbyist.count({
        where: {
          status: RegistrationStatus.APPROVED,
          ...(dateFilter && { registrationDate: dateFilter }),
        },
      }),
      // Active lobbyists (approved)
      prisma.lobbyist.count({
        where: {
          status: RegistrationStatus.APPROVED,
        },
      }),
      // Inactive lobbyists
      prisma.lobbyist.count({
        where: {
          status: RegistrationStatus.INACTIVE,
        },
      }),
      // Pending registrations
      prisma.lobbyist.count({
        where: {
          status: RegistrationStatus.PENDING,
        },
      }),
      // Previous period count (for trend calculation)
      year !== "all" ? prisma.lobbyist.count({
        where: {
          status: RegistrationStatus.APPROVED,
          registrationDate: {
            gte: new Date(parseInt(year) - 1, 0, 1),
            lte: new Date(parseInt(year) - 1, 11, 31),
          },
        },
      }) : 0,
    ]);

    const registrationTrend =
      previousPeriodLobbyists > 0
        ? ((totalLobbyists - previousPeriodLobbyists) / previousPeriodLobbyists) * 100
        : 0;

    const registrationSummary = {
      total: totalLobbyists,
      active: activeLobbyists,
      inactive: inactiveLobbyists,
      pending: pendingLobbyists,
      trend: Math.round(registrationTrend * 10) / 10,
    };

    // =========================================================================
    // 2. SPENDING ANALYSIS
    // =========================================================================

    const spendingData = await prisma.expenseLineItem.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
      where: {
        ...(dateFilter && { date: dateFilter }),
        ...(entityType !== "all" && {
          reportType: entityType === "lobbyist" ? "LOBBYIST" : "EMPLOYER",
        }),
      },
    });

    // Top 10 employers by spending
    const employerReports = await prisma.employerExpenseReport.findMany({
      where: {
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
        ...(dateFilter && { submittedAt: dateFilter }),
      },
      include: {
        employer: {
          select: { name: true },
        },
      },
    });

    const employerSpending: Record<string, { name: string; total: number }> = {};
    employerReports.forEach((report) => {
      const name = report.employer.name;
      if (!employerSpending[name]) {
        employerSpending[name] = { name, total: 0 };
      }
      employerSpending[name].total += report.totalLobbyingSpend;
    });

    const topEmployers = Object.values(employerSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Top 10 lobbyists by expenses
    const lobbyistReports = await prisma.lobbyistExpenseReport.findMany({
      where: {
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.LATE] },
        ...(dateFilter && { submittedAt: dateFilter }),
      },
      include: {
        lobbyist: {
          select: { name: true },
        },
      },
    });

    const lobbyistSpending: Record<string, { name: string; total: number }> = {};
    lobbyistReports.forEach((report) => {
      const name = report.lobbyist.name;
      if (!lobbyistSpending[name]) {
        lobbyistSpending[name] = { name, total: 0 };
      }
      lobbyistSpending[name].total += report.totalFoodEntertainment;
    });

    const topLobbyists = Object.values(lobbyistSpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Average expense per lobbyist
    const avgExpensePerLobbyist =
      activeLobbyists > 0
        ? (spendingData._sum.amount || 0) / activeLobbyists
        : 0;

    const spendingAnalysis = {
      totalExpenses: Math.round((spendingData._sum.amount || 0) * 100) / 100,
      averageExpense: Math.round((spendingData._avg.amount || 0) * 100) / 100,
      expenseCount: spendingData._count,
      avgPerLobbyist: Math.round(avgExpensePerLobbyist * 100) / 100,
      topEmployers,
      topLobbyists,
    };

    // =========================================================================
    // 3. COMPLIANCE METRICS
    // =========================================================================

    const [allLobbyistReports, allEmployerReports, violations] = await Promise.all([
      prisma.lobbyistExpenseReport.findMany({
        where: {
          status: { not: ReportStatus.DRAFT },
          ...(dateFilter && { submittedAt: dateFilter }),
        },
        select: {
          status: true,
          submittedAt: true,
          dueDate: true,
        },
      }),
      prisma.employerExpenseReport.findMany({
        where: {
          status: { not: ReportStatus.DRAFT },
          ...(dateFilter && { submittedAt: dateFilter }),
        },
        select: {
          status: true,
          submittedAt: true,
          dueDate: true,
        },
      }),
      prisma.violation.count({
        where: {
          ...(dateFilter && { issuedDate: dateFilter }),
        },
      }),
    ]);

    const allReports = [...allLobbyistReports, ...allEmployerReports];
    let onTimeCount = 0;
    let lateCount = 0;

    allReports.forEach((report) => {
      if (report.status === ReportStatus.LATE) {
        lateCount++;
      } else if (
        (report.status === ReportStatus.SUBMITTED || report.status === ReportStatus.APPROVED) &&
        report.submittedAt
      ) {
        if (report.submittedAt <= report.dueDate) {
          onTimeCount++;
        } else {
          lateCount++;
        }
      }
    });

    const totalReports = onTimeCount + lateCount;
    const onTimeRate = totalReports > 0 ? (onTimeCount / totalReports) * 100 : 0;

    const complianceMetrics = {
      onTimeSubmissions: onTimeCount,
      lateSubmissions: lateCount,
      onTimeRate: Math.round(onTimeRate * 10) / 10,
      totalViolations: violations,
      totalReports,
    };

    // =========================================================================
    // 4. QUARTERLY BREAKDOWN
    // =========================================================================

    const quarterlyData = await prisma.expenseLineItem.groupBy({
      by: ["reportId"],
      _sum: { amount: true },
      where: {
        ...(dateFilter && { date: dateFilter }),
      },
    });

    // Get quarter for each report
    const reportIds = quarterlyData.map((q) => q.reportId);
    const [lobbyistReportsQ, employerReportsQ] = await Promise.all([
      prisma.lobbyistExpenseReport.findMany({
        where: { id: { in: reportIds } },
        select: { id: true, quarter: true, year: true },
      }),
      prisma.employerExpenseReport.findMany({
        where: { id: { in: reportIds } },
        select: { id: true, quarter: true, year: true },
      }),
    ]);

    const quarterMap: Record<string, { expenses: number; reports: number }> = {};

    const addToQuarter = (quarter: Quarter, year: number, amount: number) => {
      const key = `${quarter} ${year}`;
      if (!quarterMap[key]) {
        quarterMap[key] = { expenses: 0, reports: 0 };
      }
      quarterMap[key].expenses += amount;
      quarterMap[key].reports += 1;
    };

    quarterlyData.forEach((item) => {
      const lobbyistReport = lobbyistReportsQ.find((r) => r.id === item.reportId);
      const employerReport = employerReportsQ.find((r) => r.id === item.reportId);

      if (lobbyistReport) {
        addToQuarter(lobbyistReport.quarter, lobbyistReport.year, item._sum.amount || 0);
      } else if (employerReport) {
        addToQuarter(employerReport.quarter, employerReport.year, item._sum.amount || 0);
      }
    });

    const quarterlyBreakdown = Object.entries(quarterMap).map(([quarter, data]) => ({
      quarter,
      expenses: Math.round(data.expenses * 100) / 100,
      reports: data.reports,
    }));

    // =========================================================================
    // 5. ENTITY COUNTS
    // =========================================================================

    const [employerCount, boardMemberCount, calendarEntryCount] = await Promise.all([
      prisma.employer.count(),
      prisma.boardMember.count({ where: { isActive: true } }),
      prisma.boardCalendarEntry.count({
        where: {
          ...(dateFilter && { eventDate: dateFilter }),
        },
      }),
    ]);

    const entityCounts = {
      employers: employerCount,
      activeBoardMembers: boardMemberCount,
      calendarEntries: calendarEntryCount,
      totalReports,
    };

    // =========================================================================
    // RETURN ALL INSIGHTS
    // =========================================================================

    const insights = {
      filters: {
        year,
        quarter,
        entityType,
      },
      registrationSummary,
      spendingAnalysis,
      complianceMetrics,
      quarterlyBreakdown,
      entityCounts,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights data" },
      { status: 500 }
    );
  }
}
