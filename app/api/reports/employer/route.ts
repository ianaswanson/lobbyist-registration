import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportStatus, ExpenseReportType } from "@prisma/client";

/**
 * Calculate due date for quarterly reports
 * Q1 (Jan-Mar) → Due April 15
 * Q2 (Apr-Jun) → Due July 15
 * Q3 (Jul-Sep) → Due October 15
 * Q4 (Oct-Dec) → Due January 15 (next year)
 */
function calculateDueDate(quarter: string, year: number): Date {
  const quarterMap: {
    [key: string]: { month: number; day: number; yearOffset: number };
  } = {
    Q1: { month: 3, day: 15, yearOffset: 0 }, // April 15
    Q2: { month: 6, day: 15, yearOffset: 0 }, // July 15
    Q3: { month: 9, day: 15, yearOffset: 0 }, // October 15
    Q4: { month: 0, day: 15, yearOffset: 1 }, // January 15 next year
  };

  const { month, day, yearOffset } = quarterMap[quarter];
  return new Date(year + yearOffset, month, day);
}

/**
 * POST /api/reports/employer
 * Submit or save draft employer expense report
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quarter, year, expenses, lobbyistPayments, isDraft } = body;

    // Validate required fields
    if (!quarter || !year) {
      return NextResponse.json(
        { error: "Quarter and year are required" },
        { status: 400 }
      );
    }

    // Get employer record for this user
    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer record not found" },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalExpenses =
      expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;
    const totalPayments =
      lobbyistPayments?.reduce(
        (sum: number, pay: any) => sum + pay.amountPaid,
        0
      ) || 0;
    const totalLobbyingSpend = totalExpenses + totalPayments;

    const dueDate = calculateDueDate(quarter, year);
    const now = new Date();

    // Determine status
    let status = isDraft ? ReportStatus.DRAFT : ReportStatus.SUBMITTED;
    if (!isDraft && now > dueDate) {
      status = ReportStatus.LATE;
    }

    // Upsert the report (update if exists, create if not)
    const report = await prisma.employerExpenseReport.upsert({
      where: {
        employerId_quarter_year: {
          employerId: employer.id,
          quarter,
          year: parseInt(year),
        },
      },
      update: {
        totalLobbyingSpend,
        status,
        submittedAt: isDraft ? null : now,
        dueDate,
        updatedAt: now,
      },
      create: {
        employerId: employer.id,
        quarter,
        year: parseInt(year),
        totalLobbyingSpend,
        status,
        submittedAt: isDraft ? null : now,
        dueDate,
      },
    });

    // Delete existing expense line items for this report
    await prisma.expenseLineItem.deleteMany({
      where: {
        reportId: report.id,
        reportType: ExpenseReportType.EMPLOYER,
      },
    });

    // Create new expense line items
    if (expenses && expenses.length > 0) {
      await prisma.expenseLineItem.createMany({
        data: expenses.map((expense: any) => ({
          reportId: report.id,
          reportType: ExpenseReportType.EMPLOYER,
          officialName: expense.officialName,
          date: new Date(expense.date),
          payee: expense.payee,
          purpose: expense.purpose,
          amount: expense.amount,
          isEstimate: expense.isEstimate || false,
        })),
      });
    }

    // Delete existing lobbyist payments for this report
    await prisma.employerLobbyistPayment.deleteMany({
      where: {
        employerReportId: report.id,
      },
    });

    // Create new lobbyist payments
    if (lobbyistPayments && lobbyistPayments.length > 0) {
      // For each payment, try to find the lobbyist by name
      for (const payment of lobbyistPayments) {
        // Try to find lobbyist by name (case-insensitive search for SQLite)
        const lobbyist = await prisma.lobbyist.findFirst({
          where: {
            name: {
              contains: payment.lobbyistName,
            },
          },
        });

        // Only create payment if lobbyist is found (lobbyistId is required)
        if (lobbyist) {
          await prisma.employerLobbyistPayment.create({
            data: {
              employerReportId: report.id,
              lobbyistId: lobbyist.id,
              amountPaid: payment.amountPaid,
            },
          });
        }
        // TODO: Warn user if lobbyist not found in system
      }
    }

    // TODO: Send email notification if submitted (not draft)
    // NOTE: Email notifications disabled via FEATURE_FLAGS.EMAIL_NOTIFICATIONS = false
    // This is not required by ordinance, just a UX enhancement
    // TODO: Trigger compliance check if submitted

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        quarter: report.quarter,
        year: report.year,
        totalLobbyingSpend: report.totalLobbyingSpend,
        status: report.status,
        submittedAt: report.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting employer expense report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/employer
 * Retrieve employer's expense reports
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    // Get employer record for this user
    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer record not found" },
        { status: 404 }
      );
    }

    // Build where clause
    const where: any = {
      employerId: employer.id,
    };

    if (quarter) {
      where.quarter = quarter;
    }

    if (year) {
      where.year = parseInt(year);
    }

    // Fetch reports (without lineItems - polymorphic relation)
    const reports = await prisma.employerExpenseReport.findMany({
      where,
      include: {
        lobbyistPayments: {
          include: {
            lobbyist: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ year: "desc" }, { quarter: "desc" }],
    });

    // Fetch line items separately for each report (polymorphic relationship)
    const reportsWithLineItems = await Promise.all(
      reports.map(async (report) => {
        const lineItems = await prisma.expenseLineItem.findMany({
          where: {
            reportId: report.id,
            reportType: ExpenseReportType.EMPLOYER,
          },
          orderBy: { date: "desc" },
        });
        return {
          ...report,
          lineItems,
        };
      })
    );

    return NextResponse.json({ reports: reportsWithLineItems });
  } catch (error) {
    console.error("Error fetching employer expense reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
