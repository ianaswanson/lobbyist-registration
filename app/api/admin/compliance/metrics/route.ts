/**
 * GET /api/admin/compliance/metrics - Get overall compliance metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/compliance/metrics
 * Get overall compliance metrics for dashboard
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current quarter and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentQuarter =
      currentMonth < 3
        ? "Q1"
        : currentMonth < 6
          ? "Q2"
          : currentMonth < 9
            ? "Q3"
            : "Q4";

    // Count reports this quarter - must await each count before adding
    const [
      lobbyistReportsTotal,
      employerReportsTotal,
      lobbyistReportsLate,
      employerReportsLate,
      lobbyistReportsOverdue,
      employerReportsOverdue,
      lobbyistReportsOnTime,
      employerReportsOnTime,
      activeViolations,
    ] = await Promise.all([
      // Total lobbyist reports submitted this quarter
      prisma.lobbyistExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: {
            in: ["SUBMITTED", "LATE", "APPROVED"],
          },
        },
      }),

      // Total employer reports submitted this quarter
      prisma.employerExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: {
            in: ["SUBMITTED", "LATE", "APPROVED"],
          },
        },
      }),

      // Late lobbyist reports this quarter
      prisma.lobbyistExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: "LATE",
        },
      }),

      // Late employer reports this quarter
      prisma.employerExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: "LATE",
        },
      }),

      // Overdue lobbyist reports (not yet submitted, past deadline)
      prisma.lobbyistExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: "OVERDUE",
        },
      }),

      // Overdue employer reports (not yet submitted, past deadline)
      prisma.employerExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: "OVERDUE",
        },
      }),

      // On-time lobbyist reports this quarter
      prisma.lobbyistExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: {
            in: ["SUBMITTED", "APPROVED"],
          },
        },
      }),

      // On-time employer reports this quarter
      prisma.employerExpenseReport.count({
        where: {
          quarter: currentQuarter,
          year: currentYear,
          status: {
            in: ["SUBMITTED", "APPROVED"],
          },
        },
      }),

      // Active violations (not resolved)
      prisma.violation.count({
        where: {
          status: {
            in: ["PENDING", "ISSUED", "APPEALED"],
          },
        },
      }),
    ]);

    // Sum the counts after awaiting
    const totalReportsThisQuarter = lobbyistReportsTotal + employerReportsTotal;
    const lateReports = lobbyistReportsLate + employerReportsLate;
    const overdueReports = lobbyistReportsOverdue + employerReportsOverdue;
    const onTimeReports = lobbyistReportsOnTime + employerReportsOnTime;

    // Calculate on-time submission rate
    const onTimeSubmissionRate =
      totalReportsThisQuarter > 0
        ? (onTimeReports / totalReportsThisQuarter) * 100
        : 100;

    // Determine trend (compare to previous quarter)
    // For now, use a simple heuristic: if onTimeRate > 90, trend up; if < 75, trend down
    let trend: "up" | "down" | "stable" = "stable";
    if (onTimeSubmissionRate >= 90) {
      trend = "up";
    } else if (onTimeSubmissionRate < 75) {
      trend = "down";
    }

    return NextResponse.json({
      onTimeSubmissionRate,
      totalReportsThisQuarter,
      lateReports,
      overdueReports,
      activeViolations,
      trend,
    });
  } catch (error) {
    console.error("Error fetching compliance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance metrics" },
      { status: 500 }
    );
  }
}
