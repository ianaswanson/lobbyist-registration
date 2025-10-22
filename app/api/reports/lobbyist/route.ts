import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ExpenseReportType, Quarter, ReportStatus } from "@prisma/client";

/**
 * Calculate due date for a given quarter
 * Q1 (Jan-Mar) → April 15
 * Q2 (Apr-Jun) → July 15
 * Q3 (Jul-Sep) → October 15
 * Q4 (Oct-Dec) → January 15 (next year)
 */
function calculateDueDate(quarter: Quarter, year: number): Date {
  const dueDates = {
    Q1: new Date(year, 3, 15), // April 15
    Q2: new Date(year, 6, 15), // July 15
    Q3: new Date(year, 9, 15), // October 15
    Q4: new Date(year + 1, 0, 15), // January 15 next year
  };
  return dueDates[quarter];
}

/**
 * Determine report status based on due date and submission
 */
function determineStatus(
  isDraft: boolean,
  dueDate: Date,
  submittedAt: Date | null
): ReportStatus {
  if (isDraft) return ReportStatus.DRAFT;

  const now = new Date();

  // If submitting now
  if (!submittedAt) {
    submittedAt = now;
  }

  if (submittedAt <= dueDate) {
    return ReportStatus.SUBMITTED;
  } else {
    return ReportStatus.LATE;
  }
}

/**
 * POST /api/reports/lobbyist
 * Submit or save draft lobbyist expense report
 */
export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { quarter, year, expenses, isDraft = false } = body;

    // 3. Validation
    if (!quarter || !year) {
      return NextResponse.json(
        { error: "Quarter and year are required" },
        { status: 400 }
      );
    }

    if (!["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
      return NextResponse.json(
        { error: "Invalid quarter. Must be Q1, Q2, Q3, or Q4" },
        { status: 400 }
      );
    }

    if (!Array.isArray(expenses)) {
      return NextResponse.json(
        { error: "Expenses must be an array" },
        { status: 400 }
      );
    }

    // 4. Find the lobbyist record for this user
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist record not found. Please register first." },
        { status: 404 }
      );
    }

    // 5. Calculate totals and dates
    const totalFoodEntertainment = expenses.reduce(
      (sum: number, exp: any) => sum + (exp.amount || 0),
      0
    );
    const dueDate = calculateDueDate(quarter as Quarter, year);
    const submittedAt = isDraft ? null : new Date();
    const status = determineStatus(isDraft, dueDate, submittedAt);

    // 6. Database transaction - create/update report and line items
    const result = await prisma.$transaction(async (tx) => {
      // Upsert the expense report
      const report = await tx.lobbyistExpenseReport.upsert({
        where: {
          lobbyistId_quarter_year: {
            lobbyistId: lobbyist.id,
            quarter: quarter as Quarter,
            year: year,
          },
        },
        update: {
          totalFoodEntertainment,
          status,
          submittedAt,
          dueDate,
          updatedAt: new Date(),
        },
        create: {
          lobbyistId: lobbyist.id,
          quarter: quarter as Quarter,
          year: year,
          totalFoodEntertainment,
          status,
          submittedAt,
          dueDate,
        },
      });

      // Delete existing line items for this report (we'll recreate them)
      await tx.expenseLineItem.deleteMany({
        where: {
          reportId: report.id,
          reportType: ExpenseReportType.LOBBYIST,
        },
      });

      // Create new line items
      if (expenses.length > 0) {
        await tx.expenseLineItem.createMany({
          data: expenses.map((expense: any) => ({
            reportId: report.id,
            reportType: ExpenseReportType.LOBBYIST,
            officialName: expense.officialName,
            date: new Date(expense.date),
            payee: expense.payee,
            purpose: expense.purpose,
            amount: expense.amount,
            isEstimate: expense.isEstimate || false,
          })),
        });
      }

      return report;
    });

    // 7. TODO: Handle file uploads if present
    // This would integrate with the file storage system

    // 8. TODO: Send email notification if submitted (not draft)
    // NOTE: Email notifications disabled via FEATURE_FLAGS.EMAIL_NOTIFICATIONS = false
    // This is not required by ordinance, just a UX enhancement
    // if (FEATURE_FLAGS.EMAIL_NOTIFICATIONS && !isDraft) {
    //   await sendEmail({
    //     to: session.user.email,
    //     subject: "Expense Report Submitted",
    //     template: "report-submitted",
    //     data: { quarter, year, total: totalFoodEntertainment }
    //   })
    // }

    // 9. Return success response
    return NextResponse.json({
      success: true,
      message: isDraft
        ? "Draft saved successfully"
        : "Expense report submitted successfully",
      report: {
        id: result.id,
        quarter: result.quarter,
        year: result.year,
        totalFoodEntertainment: result.totalFoodEntertainment,
        status: result.status,
        submittedAt: result.submittedAt,
        dueDate: result.dueDate,
        lineItemCount: expenses.length,
      },
    });
  } catch (error) {
    console.error("Error saving lobbyist expense report:", error);
    return NextResponse.json(
      { error: "Failed to save expense report" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/lobbyist
 * Retrieve lobbyist's expense reports
 */
export async function GET(req: Request) {
  try {
    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const quarter = searchParams.get("quarter");

    // 3. Find the lobbyist record for this user
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist record not found" },
        { status: 404 }
      );
    }

    // 4. Build where clause
    const where: any = {
      lobbyistId: lobbyist.id,
    };

    if (year) {
      where.year = parseInt(year);
    }

    if (quarter) {
      where.quarter = quarter as Quarter;
    }

    // 5. Fetch reports (without lineItems - polymorphic relation)
    const reports = await prisma.lobbyistExpenseReport.findMany({
      where,
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });

    // 6. Fetch line items separately for each report (polymorphic relationship)
    const reportsWithLineItems = await Promise.all(
      reports.map(async (report) => {
        const lineItems = await prisma.expenseLineItem.findMany({
          where: {
            reportId: report.id,
            reportType: ExpenseReportType.LOBBYIST,
          },
          orderBy: { date: "desc" },
        });
        return {
          ...report,
          lineItems,
        };
      })
    );

    // 7. Return reports
    return NextResponse.json({
      reports: reportsWithLineItems,
      count: reportsWithLineItems.length,
    });
  } catch (error) {
    console.error("Error fetching lobbyist expense reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense reports" },
      { status: 500 }
    );
  }
}
