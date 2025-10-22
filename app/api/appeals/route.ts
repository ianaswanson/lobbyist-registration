import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/appeals
 * Get appeals with optional filtering
 * Query params:
 *   - status: AppealStatus (optional)
 *   - violationId: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const violationId = searchParams.get("violationId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (violationId) {
      where.violationId = violationId;
    }

    // Only admins can see all appeals
    // Others can only see their own
    if (session.user?.role !== "ADMIN") {
      // Get violations for this user's entity
      const userId = session.user.id;

      // Find lobbyist or employer for this user
      const lobbyist = await prisma.lobbyist.findUnique({
        where: { userId },
      });

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      if (!lobbyist && !employer) {
        return NextResponse.json(
          { error: "Not authorized to view appeals" },
          { status: 403 }
        );
      }

      // Get violations for this entity
      const violations = await prisma.violation.findMany({
        where: {
          OR: [
            lobbyist ? { entityId: lobbyist.id, entityType: "LOBBYIST" } : {},
            employer ? { entityId: employer.id, entityType: "EMPLOYER" } : {},
          ],
        },
        select: { id: true },
      });

      const violationIds = violations.map((v) => v.id);
      where.violationId = { in: violationIds };
    }

    const appeals = await prisma.appeal.findMany({
      where,
      include: {
        violation: {
          select: {
            id: true,
            entityType: true,
            entityId: true,
            violationType: true,
            description: true,
            fineAmount: true,
            status: true,
            issuedDate: true,
          },
        },
      },
      orderBy: {
        submittedDate: "desc",
      },
    });

    return NextResponse.json(appeals);
  } catch (error) {
    console.error("Error fetching appeals:", error);
    return NextResponse.json(
      { error: "Failed to fetch appeals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appeals
 * Create a new appeal for a violation
 * Body:
 *   - violationId: string
 *   - reason: string
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { violationId, reason } = body;

    // Validate required fields
    if (!violationId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: violationId, reason" },
        { status: 400 }
      );
    }

    // Get the violation
    const violation = await prisma.violation.findUnique({
      where: { id: violationId },
    });

    if (!violation) {
      return NextResponse.json(
        { error: "Violation not found" },
        { status: 404 }
      );
    }

    // Verify user has permission to appeal this violation
    if (session.user?.role !== "ADMIN") {
      const userId = session.user.id;

      const lobbyist = await prisma.lobbyist.findUnique({
        where: { userId },
      });

      const employer = await prisma.employer.findUnique({
        where: { userId },
      });

      const canAppeal =
        (lobbyist &&
          violation.entityId === lobbyist.id &&
          violation.entityType === "LOBBYIST") ||
        (employer &&
          violation.entityId === employer.id &&
          violation.entityType === "EMPLOYER");

      if (!canAppeal) {
        return NextResponse.json(
          { error: "Not authorized to appeal this violation" },
          { status: 403 }
        );
      }
    }

    // Check if violation is in appealable status
    if (violation.status !== "ISSUED") {
      return NextResponse.json(
        {
          error:
            "This violation cannot be appealed (status: " +
            violation.status +
            ")",
        },
        { status: 400 }
      );
    }

    // Check if already appealed
    const existingAppeal = await prisma.appeal.findFirst({
      where: { violationId },
    });

    if (existingAppeal) {
      return NextResponse.json(
        { error: "This violation has already been appealed" },
        { status: 400 }
      );
    }

    // Calculate 30-day deadline from issuedDate
    if (!violation.issuedDate) {
      return NextResponse.json(
        { error: "Violation must have an issued date to be appealed" },
        { status: 400 }
      );
    }

    const appealDeadline = new Date(violation.issuedDate);
    appealDeadline.setDate(appealDeadline.getDate() + 30);

    // Check if past deadline
    if (new Date() > appealDeadline) {
      return NextResponse.json(
        { error: "Appeal deadline has passed (30 days from issuance)" },
        { status: 400 }
      );
    }

    // Create the appeal and update violation status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const appeal = await tx.appeal.create({
        data: {
          violationId,
          reason,
          appealDeadline,
          status: "PENDING",
        },
      });

      await tx.violation.update({
        where: { id: violationId },
        data: { status: "APPEALED" },
      });

      return appeal;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating appeal:", error);
    return NextResponse.json(
      { error: "Failed to create appeal" },
      { status: 500 }
    );
  }
}
