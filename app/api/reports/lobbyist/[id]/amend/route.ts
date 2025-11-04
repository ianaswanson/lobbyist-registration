import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { ReportStatus, ExpenseReportType } from "@prisma/client";
import { randomUUID } from "crypto";

/**
 * POST /api/reports/lobbyist/[id]/amend
 * Create an amendment for a submitted lobbyist expense report
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amendmentReason } = body;

    // 1. Validate amendment reason
    if (!amendmentReason || amendmentReason.trim().length === 0) {
      return NextResponse.json(
        { error: "Amendment reason is required" },
        { status: 400 }
      );
    }

    // 2. Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // 4. Fetch the original report
    const originalReport = await prisma.lobbyistExpenseReport.findUnique({
      where: { id },
    });

    if (!originalReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // 5. Verify this report belongs to the authenticated user
    if (originalReport.lobbyistId !== lobbyist.id) {
      return NextResponse.json(
        { error: "You do not have permission to amend this report" },
        { status: 403 }
      );
    }

    // 6. Verify report is in amendable status (SUBMITTED, LATE, or APPROVED)
    const amendableStatuses = [
      ReportStatus.SUBMITTED,
      ReportStatus.LATE,
      ReportStatus.APPROVED,
    ];
    if (!amendableStatuses.includes(originalReport.status)) {
      return NextResponse.json(
        {
          error: `Only ${amendableStatuses.join(", ")} reports can be amended. This report has status: ${originalReport.status}`,
        },
        { status: 400 }
      );
    }

    // 7. Check if this report was already amended
    if (originalReport.amendedByReportId) {
      return NextResponse.json(
        {
          error:
            "This report has already been amended. Please amend the most recent version instead.",
        },
        { status: 400 }
      );
    }

    // 8. Fetch line items from original report
    const originalLineItems = await prisma.expenseLineItem.findMany({
      where: {
        reportId: originalReport.id,
        reportType: ExpenseReportType.LOBBYIST,
      },
    });

    // 9. Create amendment report in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the amended report with same data but new ID
      const amendedReport = await tx.lobbyistExpenseReport.create({
        data: {
          id: randomUUID(), // Explicit ID generation
          lobbyistId: originalReport.lobbyistId,
          quarter: originalReport.quarter,
          year: originalReport.year,
          totalFoodEntertainment: originalReport.totalFoodEntertainment,
          status: ReportStatus.DRAFT, // Start as draft
          dueDate: originalReport.dueDate,
          amendmentReason,
          originalReportId: originalReport.id,
          // Don't copy submittedAt, reviewedBy, reviewedAt, reviewNotes
        },
      });

      // Copy all line items to the new report
      if (originalLineItems.length > 0) {
        await tx.expenseLineItem.createMany({
          data: originalLineItems.map((item) => ({
            reportId: amendedReport.id,
            reportType: ExpenseReportType.LOBBYIST,
            officialName: item.officialName,
            date: item.date,
            payee: item.payee,
            purpose: item.purpose,
            amount: item.amount,
            isEstimate: item.isEstimate,
          })),
        });
      }

      // Update original report to mark it as amended
      await tx.lobbyistExpenseReport.update({
        where: { id: originalReport.id },
        data: {
          status: ReportStatus.AMENDED,
          amendedByReportId: amendedReport.id,
        },
      });

      return amendedReport;
    });

    // 10. Return the new amendment report
    return NextResponse.json({
      success: true,
      amendedReport: result,
      message:
        "Amendment created successfully. You can now edit and submit the amended report.",
    });
  } catch (error) {
    console.error("Error creating amendment:", error);
    return NextResponse.json(
      { error: "Failed to create amendment" },
      { status: 500 }
    );
  }
}
