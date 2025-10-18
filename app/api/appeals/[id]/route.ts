import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/appeals/[id]
 * Update an appeal (admin only)
 * Body:
 *   - status: AppealStatus (optional)
 *   - hearingDate: string ISO date (optional)
 *   - decision: string (optional - required when status = DECIDED)
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

    // Only admins can update appeals
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appealId = params.id;
    const body = await request.json();
    const { status, hearingDate, decision } = body;

    // Get the appeal
    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
      include: { violation: true },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    }

    // Validate decision is provided when status is DECIDED
    if (status === "DECIDED" && !decision) {
      return NextResponse.json(
        { error: "Decision text is required when marking appeal as decided" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (hearingDate) {
      updateData.hearingDate = new Date(hearingDate);
    }

    if (decision) {
      updateData.decision = decision;
      updateData.decidedAt = new Date();
    }

    // If status is DECIDED, also update the violation status
    let violationUpdate = null;
    if (status === "DECIDED" && decision) {
      // Determine if appeal is upheld or overturned based on decision
      // For now, require explicit decision in the update
      // In future, could parse decision text or add upheld/overturned field
    }

    // Update the appeal
    const updatedAppeal = await prisma.appeal.update({
      where: { id: appealId },
      data: updateData,
    });

    return NextResponse.json(updatedAppeal);
  } catch (error) {
    console.error("Error updating appeal:", error);
    return NextResponse.json(
      { error: "Failed to update appeal" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appeals/[id]/decide
 * Decide on an appeal (admin only) - upholds or overturns
 * Body:
 *   - outcome: "UPHELD" | "OVERTURNED"
 *   - decision: string
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can decide appeals
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appealId = params.id;
    const body = await request.json();
    const { outcome, decision } = body;

    // Validate inputs
    if (!outcome || !decision) {
      return NextResponse.json(
        { error: "Missing required fields: outcome, decision" },
        { status: 400 }
      );
    }

    if (outcome !== "UPHELD" && outcome !== "OVERTURNED") {
      return NextResponse.json(
        { error: "Outcome must be UPHELD or OVERTURNED" },
        { status: 400 }
      );
    }

    // Get the appeal
    const appeal = await prisma.appeal.findUnique({
      where: { id: appealId },
      include: { violation: true },
    });

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    }

    // Update appeal and violation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update appeal
      const updatedAppeal = await tx.appeal.update({
        where: { id: appealId },
        data: {
          status: "DECIDED",
          decision,
          decidedAt: new Date(),
        },
      });

      // Update violation status based on outcome
      await tx.violation.update({
        where: { id: appeal.violationId },
        data: {
          status: outcome, // UPHELD or OVERTURNED
          resolutionNotes: `Appeal decided: ${outcome}. ${decision}`,
          resolutionDate: new Date(),
        },
      });

      return updatedAppeal;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deciding appeal:", error);
    return NextResponse.json(
      { error: "Failed to decide appeal" },
      { status: 500 }
    );
  }
}
