/**
 * Compliance Alert Generator
 *
 * Automated rule-based detection system for compliance issues.
 * Runs various detection rules against recent data and creates alerts.
 */

import { prisma } from "@/lib/db";
import { AlertType, AlertSeverity, Quarter } from "@prisma/client";

interface AlertResult {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  relatedReportId?: string;
  relatedUserId?: string;
}

/**
 * Main function to run all compliance checks and generate alerts
 */
export async function generateComplianceAlerts(): Promise<number> {
  const alerts: AlertResult[] = [];

  // Run all detection rules
  alerts.push(...(await detectUnusualSpending()));
  alerts.push(...(await detectDuplicateEntries()));
  alerts.push(...(await detectOverdueReports()));
  alerts.push(...(await detectMissingFields()));
  alerts.push(...(await detectRoundNumberPatterns()));
  alerts.push(...(await detectFirstTimeFilers()));

  // Save all alerts to database
  if (alerts.length > 0) {
    await prisma.complianceAlert.createMany({
      data: alerts,
      skipDuplicates: true,
    });
  }

  return alerts.length;
}

/**
 * Rule 1: Detect unusual spending patterns
 * Flags if expenses increase >300% from previous quarter
 */
async function detectUnusualSpending(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Get all lobbyists with at least 2 quarters of data
  const lobbyists = await prisma.lobbyist.findMany({
    where: { status: "APPROVED" },
    include: {
      expenseReports: {
        where: { status: { in: ["SUBMITTED", "LATE", "APPROVED"] } },
        orderBy: [{ year: "desc" }, { quarter: "desc" }],
        take: 2,
      },
    },
  });

  for (const lobbyist of lobbyists) {
    if (lobbyist.expenseReports.length >= 2) {
      const [current, previous] = lobbyist.expenseReports;
      const currentTotal = current.totalFoodEntertainment;
      const previousTotal = previous.totalFoodEntertainment;

      if (previousTotal > 0 && currentTotal > previousTotal * 3) {
        const percentIncrease = Math.round(
          ((currentTotal - previousTotal) / previousTotal) * 100
        );
        alerts.push({
          type: "UNUSUAL_SPENDING",
          severity: "HIGH",
          message: `${lobbyist.name}: Expenses increased ${percentIncrease}% (${formatCurrency(previousTotal)} → ${formatCurrency(currentTotal)}) from ${previous.quarter} to ${current.quarter} ${current.year}`,
          relatedReportId: current.id,
          relatedUserId: lobbyist.userId,
        });
      }
    }
  }

  // Check employers too
  const employers = await prisma.employer.findMany({
    include: {
      expenseReports: {
        where: { status: { in: ["SUBMITTED", "LATE", "APPROVED"] } },
        orderBy: [{ year: "desc" }, { quarter: "desc" }],
        take: 2,
      },
    },
  });

  for (const employer of employers) {
    if (employer.expenseReports.length >= 2) {
      const [current, previous] = employer.expenseReports;
      const currentTotal = current.totalLobbyingSpend;
      const previousTotal = previous.totalLobbyingSpend;

      if (previousTotal > 0 && currentTotal > previousTotal * 3) {
        const percentIncrease = Math.round(
          ((currentTotal - previousTotal) / previousTotal) * 100
        );
        alerts.push({
          type: "UNUSUAL_SPENDING",
          severity: "HIGH",
          message: `${employer.name}: Expenses increased ${percentIncrease}% (${formatCurrency(previousTotal)} → ${formatCurrency(currentTotal)}) from ${previous.quarter} to ${current.quarter} ${current.year}`,
          relatedReportId: current.id,
          relatedUserId: employer.userId || undefined,
        });
      }
    }
  }

  return alerts;
}

/**
 * Rule 2: Detect duplicate entries
 * Flags if 2+ line items have same date + amount + payee
 */
async function detectDuplicateEntries(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Find duplicate line items by grouping on date, amount, payee
  const duplicates = await prisma.$queryRaw<
    Array<{
      date: Date;
      amount: number;
      payee: string;
      count: bigint;
      reportId: string;
      reportType: string;
    }>
  >`
    SELECT date, amount, payee, COUNT(*) as count, report_id as "reportId", report_type as "reportType"
    FROM "ExpenseLineItem"
    GROUP BY date, amount, payee, report_id, report_type
    HAVING COUNT(*) > 1
  `;

  for (const dup of duplicates) {
    alerts.push({
      type: "DUPLICATE_ENTRY",
      severity: "MEDIUM",
      message: `Possible duplicate entries: ${Number(dup.count)} items with same date (${formatDate(dup.date)}), amount (${formatCurrency(dup.amount)}), and payee (${dup.payee})`,
      relatedReportId: dup.reportId,
    });
  }

  return alerts;
}

/**
 * Rule 3: Detect overdue reports
 * Flags reports not submitted by deadline
 */
async function detectOverdueReports(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];
  const now = new Date();

  // Overdue lobbyist reports
  const overdueLobbyistReports = await prisma.lobbyistExpenseReport.findMany({
    where: {
      status: "OVERDUE",
      dueDate: { lt: now },
    },
    include: {
      lobbyist: true,
    },
  });

  for (const report of overdueLobbyistReports) {
    const daysOverdue = Math.floor(
      (now.getTime() - report.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      type: "OVERDUE_REPORT",
      severity: daysOverdue > 30 ? "HIGH" : "MEDIUM",
      message: `${report.lobbyist.name}: ${report.quarter} ${report.year} report is ${daysOverdue} days overdue (due ${formatDate(report.dueDate)})`,
      relatedReportId: report.id,
      relatedUserId: report.lobbyist.userId,
    });
  }

  // Overdue employer reports
  const overdueEmployerReports = await prisma.employerExpenseReport.findMany({
    where: {
      status: "OVERDUE",
      dueDate: { lt: now },
    },
    include: {
      employer: true,
    },
  });

  for (const report of overdueEmployerReports) {
    const daysOverdue = Math.floor(
      (now.getTime() - report.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    alerts.push({
      type: "OVERDUE_REPORT",
      severity: daysOverdue > 30 ? "HIGH" : "MEDIUM",
      message: `${report.employer.name}: ${report.quarter} ${report.year} report is ${daysOverdue} days overdue (due ${formatDate(report.dueDate)})`,
      relatedReportId: report.id,
      relatedUserId: report.employer.userId || undefined,
    });
  }

  return alerts;
}

/**
 * Rule 4: Detect missing required fields
 * Flags submitted reports with incomplete data
 */
async function detectMissingFields(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Check for expense line items with missing/empty fields
  const incompleteLineItems = await prisma.expenseLineItem.findMany({
    where: {
      OR: [
        { officialName: "" },
        { payee: "" },
        { purpose: "" },
        { amount: 0 },
      ],
    },
    select: {
      id: true,
      reportId: true,
      reportType: true,
      officialName: true,
      payee: true,
      purpose: true,
    },
  });

  // Group by reportId
  const reportIssues = new Map<string, number>();
  for (const item of incompleteLineItems) {
    const count = reportIssues.get(item.reportId) || 0;
    reportIssues.set(item.reportId, count + 1);
  }

  for (const [reportId, count] of reportIssues.entries()) {
    const firstItem = incompleteLineItems.find((i) => i.reportId === reportId);
    if (firstItem) {
      alerts.push({
        type: "MISSING_FIELDS",
        severity: "MEDIUM",
        message: `Report has ${count} line item(s) with missing required fields (official name, payee, purpose, or amount)`,
        relatedReportId: reportId,
      });
    }
  }

  return alerts;
}

/**
 * Rule 5: Detect round number patterns
 * Gentle flag for exactly round amounts ($5,000, $10,000)
 */
async function detectRoundNumberPatterns(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Find reports with multiple round-number expenses
  const reports = await prisma.lobbyistExpenseReport.findMany({
    where: {
      status: { in: ["SUBMITTED", "LATE", "APPROVED"] },
    },
    include: {
      lobbyist: true,
    },
  });

  for (const report of reports) {
    // Get line items for this report
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: "LOBBYIST",
      },
    });

    // Count how many are exactly round numbers (divisible by 1000)
    const roundNumbers = lineItems.filter(
      (item) => item.amount >= 1000 && item.amount % 1000 === 0
    );

    if (roundNumbers.length >= 2) {
      alerts.push({
        type: "ROUND_NUMBER_PATTERN",
        severity: "LOW",
        message: `${report.lobbyist.name}: ${report.quarter} ${report.year} report has ${roundNumbers.length} expenses with exactly round amounts (e.g., $${roundNumbers[0].amount.toLocaleString()})`,
        relatedReportId: report.id,
        relatedUserId: report.lobbyist.userId,
      });
    }
  }

  return alerts;
}

/**
 * Rule 6: Detect first-time filers
 * Flag new lobbyist's first report for extra review
 */
async function detectFirstTimeFilers(): Promise<AlertResult[]> {
  const alerts: AlertResult[] = [];

  // Find lobbyists who have exactly 1 approved report
  const lobbyists = await prisma.lobbyist.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      expenseReports: {
        where: {
          status: { in: ["SUBMITTED", "LATE", "APPROVED"] },
        },
      },
    },
  });

  for (const lobbyist of lobbyists) {
    if (lobbyist.expenseReports.length === 1) {
      const report = lobbyist.expenseReports[0];
      alerts.push({
        type: "FIRST_TIME_FILER",
        severity: "LOW",
        message: `${lobbyist.name}: First quarterly report filed (${report.quarter} ${report.year}). Recommend extra review to catch any registration errors.`,
        relatedReportId: report.id,
        relatedUserId: lobbyist.userId,
      });
    }
  }

  return alerts;
}

/**
 * Clear all reviewed alerts older than 90 days
 */
export async function cleanupOldAlerts(): Promise<number> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.complianceAlert.deleteMany({
    where: {
      reviewedAt: {
        not: null,
        lt: ninetyDaysAgo,
      },
    },
  });

  return result.count;
}

/**
 * Get count of active alerts by severity
 */
export async function getActiveAlertCounts(): Promise<{
  total: number;
  high: number;
  medium: number;
  low: number;
}> {
  const [total, high, medium, low] = await Promise.all([
    prisma.complianceAlert.count({ where: { reviewedAt: null } }),
    prisma.complianceAlert.count({
      where: { reviewedAt: null, severity: "HIGH" },
    }),
    prisma.complianceAlert.count({
      where: { reviewedAt: null, severity: "MEDIUM" },
    }),
    prisma.complianceAlert.count({
      where: { reviewedAt: null, severity: "LOW" },
    }),
  ]);

  return { total, high, medium, low };
}

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US").format(date);
}
