import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { RegistrationStatus } from "@prisma/client";

/**
 * POST /api/admin/registrations/[id]
 * Approve or reject a lobbyist registration
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { action, notes } = body;

    // 3. Validation
    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    if (action === "reject" && !notes) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting" },
        { status: 400 }
      );
    }

    // 4. Find the lobbyist registration
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist registration not found" },
        { status: 404 }
      );
    }

    // 5. Check if already reviewed
    if (lobbyist.status !== RegistrationStatus.PENDING) {
      return NextResponse.json(
        {
          error: `Registration has already been ${lobbyist.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // 6. Update registration status
    const newStatus =
      action === "approve"
        ? RegistrationStatus.APPROVED
        : RegistrationStatus.REJECTED;

    const updatedLobbyist = await prisma.lobbyist.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: action === "reject" ? notes : null,
      },
    });

    // 7. TODO: Send email notification to lobbyist
    // NOTE: Email notifications disabled via FEATURE_FLAGS.EMAIL_NOTIFICATIONS = false
    // This is not required by ordinance, just a UX enhancement
    // if (FEATURE_FLAGS.EMAIL_NOTIFICATIONS) {
    //   if (action === "approve") {
    //     await sendEmail({
    //       to: lobbyist.email,
    //       subject: "Registration Approved",
    //       template: "registration-approved",
    //     })
    //   } else {
    //     await sendEmail({
    //       to: lobbyist.email,
    //       subject: "Registration Requires Attention",
    //       template: "registration-rejected",
    //       data: { reason: notes }
    //     })
    //   }
    // }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message:
        action === "approve"
          ? "Registration approved successfully"
          : "Registration rejected",
      lobbyist: {
        id: updatedLobbyist.id,
        name: updatedLobbyist.name,
        status: updatedLobbyist.status,
        reviewedAt: updatedLobbyist.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Error reviewing lobbyist registration:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/registrations/[id]
 * Get details of a specific registration
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Check authentication and admin role
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch registration with related data
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        employers: {
          include: {
            employer: true,
          },
        },
      },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist registration not found" },
        { status: 404 }
      );
    }

    // 3. Return registration details
    return NextResponse.json({
      lobbyist,
    });
  } catch (error) {
    console.error("Error fetching lobbyist registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration" },
      { status: 500 }
    );
  }
}
