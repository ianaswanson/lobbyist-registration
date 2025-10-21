import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { ReportStatus } from "@prisma/client"

/**
 * POST /api/admin/reports/[id]
 * Approve, reject, or request clarification for an expense report
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication and admin role
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse request body
    const body = await req.json()
    const { action, notes, reportType } = body

    // 3. Validation
    if (
      !action ||
      !["approve", "reject", "request_clarification"].includes(action)
    ) {
      return NextResponse.json(
        {
          error:
            "Action must be 'approve', 'reject', or 'request_clarification'",
        },
        { status: 400 }
      )
    }

    if (!reportType || !["lobbyist", "employer"].includes(reportType)) {
      return NextResponse.json(
        { error: "reportType must be 'lobbyist' or 'employer'" },
        { status: 400 }
      )
    }

    if ((action === "reject" || action === "request_clarification") && !notes) {
      return NextResponse.json(
        {
          error: `Notes are required when ${action === "reject" ? "rejecting" : "requesting clarification"}`,
        },
        { status: 400 }
      )
    }

    // 4. Find the expense report
    let report: any
    if (reportType === "lobbyist") {
      report = await prisma.lobbyistExpenseReport.findUnique({
        where: { id: params.id },
        include: {
          lobbyist: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })
    } else {
      report = await prisma.employerExpenseReport.findUnique({
        where: { id: params.id },
        include: {
          employer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })
    }

    if (!report) {
      return NextResponse.json(
        { error: "Expense report not found" },
        { status: 404 }
      )
    }

    // 5. Check if already reviewed
    if (
      [
        ReportStatus.APPROVED,
        ReportStatus.REJECTED,
        ReportStatus.NEEDS_CLARIFICATION,
      ].includes(report.status)
    ) {
      return NextResponse.json(
        {
          error: `Report has already been reviewed (status: ${report.status})`,
        },
        { status: 400 }
      )
    }

    // 6. Determine new status
    let newStatus: ReportStatus
    if (action === "approve") {
      newStatus = ReportStatus.APPROVED
    } else if (action === "reject") {
      newStatus = ReportStatus.REJECTED
    } else {
      newStatus = ReportStatus.NEEDS_CLARIFICATION
    }

    // 7. Update report status
    let updatedReport: any
    if (reportType === "lobbyist") {
      updatedReport = await prisma.lobbyistExpenseReport.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      })
    } else {
      updatedReport = await prisma.employerExpenseReport.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNotes: notes || null,
        },
      })
    }

    // 8. TODO: Send email notification
    // NOTE: Email notifications disabled via FEATURE_FLAGS.EMAIL_NOTIFICATIONS = false
    // This is not required by ordinance, just a UX enhancement
    // if (FEATURE_FLAGS.EMAIL_NOTIFICATIONS) {
    //   const email = reportType === "lobbyist" ? report.lobbyist.email : report.employer.email
    //   if (action === "approve") {
    //     await sendEmail({
    //       to: email,
    //       subject: "Expense Report Approved",
    //       template: "report-approved",
    //     })
    //   } else if (action === "reject") {
    //     await sendEmail({
    //       to: email,
    //       subject: "Expense Report Rejected",
    //       template: "report-rejected",
    //       data: { reason: notes }
    //     })
    //   } else {
    //     await sendEmail({
    //       to: email,
    //       subject: "Clarification Needed for Expense Report",
    //       template: "report-clarification",
    //       data: { message: notes }
    //     })
    //   }
    // }

    // 9. Return success response
    let message: string
    if (action === "approve") {
      message = "Expense report approved successfully"
    } else if (action === "reject") {
      message = "Expense report rejected"
    } else {
      message = "Clarification requested"
    }

    return NextResponse.json({
      success: true,
      message,
      report: {
        id: updatedReport.id,
        status: updatedReport.status,
        reviewedAt: updatedReport.reviewedAt,
      },
    })
  } catch (error) {
    console.error("Error reviewing expense report:", error)
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/reports/[id]
 * Get details of a specific report
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication and admin role
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get query parameter for report type
    const { searchParams } = new URL(req.url)
    const reportType = searchParams.get("type") || "lobbyist"

    // 3. Fetch report with related data
    let report: any
    if (reportType === "lobbyist") {
      report = await prisma.lobbyistExpenseReport.findUnique({
        where: { id: params.id },
        include: {
          lobbyist: {
            select: {
              name: true,
              email: true,
            },
          },
          lineItems: true,
        },
      })
    } else {
      report = await prisma.employerExpenseReport.findUnique({
        where: { id: params.id },
        include: {
          employer: {
            select: {
              name: true,
              email: true,
            },
          },
          lineItems: true,
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
      })
    }

    if (!report) {
      return NextResponse.json(
        { error: "Expense report not found" },
        { status: 404 }
      )
    }

    // 4. Return report details
    return NextResponse.json({
      report,
    })
  } catch (error) {
    console.error("Error fetching expense report:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}
