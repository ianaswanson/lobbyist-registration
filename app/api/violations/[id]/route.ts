import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/violations/[id]
 * Get a single violation with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can view violations
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const violation = await prisma.violation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        appeal: true,
      },
    });

    if (!violation) {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error fetching violation:", error);
    return NextResponse.json(
      { error: "Failed to fetch violation" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/violations/[id]
 * Update a violation
 * Body:
 *   - status: ViolationStatus (optional)
 *   - fineAmount: number (optional)
 *   - description: string (optional)
 *   - resolutionNotes: string (optional)
 *   - resolutionDate: Date (optional)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can update violations
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, fineAmount, description, resolutionNotes, resolutionDate } =
      body;

    // Validate fine amount if provided
    if (fineAmount && fineAmount > 500) {
      return NextResponse.json(
        { error: "Fine amount cannot exceed $500" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (fineAmount !== undefined) {
      updateData.fineAmount = fineAmount;
    }

    if (description) {
      updateData.description = description;
    }

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    if (resolutionDate) {
      updateData.resolutionDate = new Date(resolutionDate);
    }

    // If status is being set to PAID, WAIVED, or APPEALED_GRANTED, set resolution date
    if (
      status &&
      (status === "PAID" || status === "WAIVED" || status === "APPEALED_GRANTED")
    ) {
      updateData.resolutionDate = updateData.resolutionDate || new Date();
    }

    const violation = await prisma.violation.update({
      where: {
        id: params.id,
      },
      data: updateData,
      include: {
        appeal: true,
      },
    });

    // TODO: Send notification email if status changed

    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error updating violation:", error);
    return NextResponse.json(
      { error: "Failed to update violation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/violations/[id]
 * Soft delete a violation (set status to CANCELLED)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete violations
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete by setting status to a cancelled/void state
    // We don't hard-delete for audit trail purposes
    const violation = await prisma.violation.update({
      where: {
        id: params.id,
      },
      data: {
        status: "WAIVED",
        resolutionNotes: "Violation cancelled by admin",
        resolutionDate: new Date(),
      },
    });

    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error deleting violation:", error);
    return NextResponse.json(
      { error: "Failed to delete violation" },
      { status: 500 }
    );
  }
}
