import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/violations
 * List violations with optional filtering
 * Query params:
 *   - status: ViolationStatus (optional)
 *   - entityType: EntityType (optional)
 *   - entityId: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    // Non-admins can only view their own violations
    if (session.user?.role !== "ADMIN") {
      // If entityId is provided, verify it belongs to the user
      if (!entityId) {
        return NextResponse.json(
          { error: "Entity ID required for non-admin users" },
          { status: 400 }
        );
      }

      // Verify the entityId belongs to the current user
      if (session.user.role === "LOBBYIST") {
        const lobbyist = await prisma.lobbyist.findUnique({
          where: { userId: session.user.id },
        });
        if (!lobbyist || lobbyist.id !== entityId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else if (session.user.role === "EMPLOYER") {
        const employer = await prisma.employer.findUnique({
          where: { userId: session.user.id },
        });
        if (!employer || employer.id !== entityId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    }

    const violations = await prisma.violation.findMany({
      where,
      include: {
        appeals: true,
      },
      orderBy: {
        issuedDate: "desc",
      },
    });

    return NextResponse.json(violations);
  } catch (error) {
    console.error("Error fetching violations:", error);
    return NextResponse.json(
      { error: "Failed to fetch violations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/violations
 * Create a new violation
 * Body:
 *   - entityType: EntityType
 *   - entityId: string
 *   - violationType: ViolationType
 *   - description: string
 *   - fineAmount: number (optional, max 500)
 *   - sendEducationalLetter: boolean
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can create violations
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      entityType,
      entityId,
      violationType,
      description,
      fineAmount,
      sendEducationalLetter,
    } = body;

    // Validate required fields
    if (!entityType || !entityId || !violationType || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate fine amount (max $500 per ordinance §3.808)
    if (fineAmount && fineAmount > 500) {
      return NextResponse.json(
        { error: "Fine amount cannot exceed $500" },
        { status: 400 }
      );
    }

    // Create violation
    const violation = await prisma.violation.create({
      data: {
        entityType,
        entityId,
        violationType,
        description,
        fineAmount: fineAmount || 0,
        status: "ISSUED",
        issuedDate: new Date(),
        isFirstTimeViolation: sendEducationalLetter,
      },
    });

    // TODO: Send notification email to entity
    // TODO: If sendEducationalLetter is true, send educational letter instead of fine

    return NextResponse.json(violation, { status: 201 });
  } catch (error) {
    console.error("Error creating violation:", error);
    return NextResponse.json(
      { error: "Failed to create violation" },
      { status: 500 }
    );
  }
}
