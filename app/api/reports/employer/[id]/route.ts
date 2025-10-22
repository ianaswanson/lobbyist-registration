import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ReportStatus, ExpenseReportType } from "@prisma/client";

/**
 * GET /api/reports/employer/[id]
 * Get a single employer expense report by ID
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the employer record for this user
    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer record not found" },
        { status: 404 }
      );
    }

    // 3. Fetch the specific report (without lineItems - polymorphic relation)
    const report = await prisma.employerExpenseReport.findUnique({
      where: {
        id,
      },
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
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 4. Verify this report belongs to the authenticated user
    if (report.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this report" },
        { status: 403 }
      );
    }

    // 5. Fetch line items separately (polymorphic relationship)
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: ExpenseReportType.EMPLOYER,
      },
      orderBy: { date: "desc" },
    });

    // 6. Return the report with line items
    return NextResponse.json({
      report: {
        ...report,
        lineItems,
      },
    });
  } catch (error) {
    console.error("Error fetching employer expense report:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense report" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/employer/[id]
 * Delete a draft employer expense report
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the employer record for this user
    const employer = await prisma.employer.findUnique({
      where: { userId: session.user.id },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer record not found" },
        { status: 404 }
      );
    }

    // 3. Find the report
    const report = await prisma.employerExpenseReport.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 4. Verify this report belongs to the authenticated user
    if (report.employerId !== employer.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this report" },
        { status: 403 }
      );
    }

    // 5. Only allow deleting draft reports
    if (report.status !== ReportStatus.DRAFT) {
      return NextResponse.json(
        {
          error:
            "Only draft reports can be deleted. Submitted reports must be edited or withdrawn through proper channels.",
        },
        { status: 400 }
      );
    }

    // 6. Delete the report and its related records (in transaction)
    await prisma.$transaction(async (tx) => {
      // Delete line items
      await tx.expenseLineItem.deleteMany({
        where: {
          reportId: id,
          reportType: ExpenseReportType.EMPLOYER,
        },
      });

      // Delete lobbyist payments
      await tx.employerLobbyistPayment.deleteMany({
        where: {
          employerReportId: id,
        },
      });

      // Delete the report
      await tx.employerExpenseReport.delete({
        where: {
          id,
        },
      });
    });

    // 7. Return success
    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employer expense report:", error);
    return NextResponse.json(
      { error: "Failed to delete expense report" },
      { status: 500 }
    );
  }
}
