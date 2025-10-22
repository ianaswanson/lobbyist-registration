import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ReportStatus, ExpenseReportType } from "@prisma/client";

/**
 * GET /api/reports/lobbyist/[id]
 * Get a single lobbyist expense report by ID
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

    // 2. Find the lobbyist record for this user
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist record not found" },
        { status: 404 }
      );
    }

    // 3. Fetch the specific report (without lineItems - polymorphic relation)
    const report = await prisma.lobbyistExpenseReport.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 4. Verify this report belongs to the authenticated user
    if (report.lobbyistId !== lobbyist.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this report" },
        { status: 403 }
      );
    }

    // 5. Fetch line items separately (polymorphic relationship)
    const lineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: report.id,
        reportType: ExpenseReportType.LOBBYIST,
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
    console.error("Error fetching lobbyist expense report:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense report" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reports/lobbyist/[id]
 * Delete a draft lobbyist expense report
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

    // 2. Find the lobbyist record for this user
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist record not found" },
        { status: 404 }
      );
    }

    // 3. Find the report
    const report = await prisma.lobbyistExpenseReport.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // 4. Verify this report belongs to the authenticated user
    if (report.lobbyistId !== lobbyist.id) {
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

    // 6. Delete the report and its line items (in transaction)
    await prisma.$transaction(async (tx) => {
      // Delete line items first
      await tx.expenseLineItem.deleteMany({
        where: {
          reportId: id,
          reportType: ExpenseReportType.LOBBYIST,
        },
      });

      // Delete the report
      await tx.lobbyistExpenseReport.delete({
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
    console.error("Error deleting lobbyist expense report:", error);
    return NextResponse.json(
      { error: "Failed to delete expense report" },
      { status: 500 }
    );
  }
}
