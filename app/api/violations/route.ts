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
        Appeal: true,
      },
      orderBy: {
        issuedDate: "desc",
      },
    });

    // Enrich violations with entity details (names instead of just IDs)
    const enrichedViolations = await Promise.all(
      violations.map(async (violation) => {
        let entityName = null;
        let entityEmail = null;

        try {
          if (violation.entityType === "LOBBYIST") {
            const lobbyist = await prisma.lobbyist.findUnique({
              where: { id: violation.entityId },
              select: { name: true, email: true },
            });
            entityName = lobbyist?.name;
            entityEmail = lobbyist?.email;
          } else if (violation.entityType === "EMPLOYER") {
            const employer = await prisma.employer.findUnique({
              where: { id: violation.entityId },
              select: { name: true, email: true },
            });
            entityName = employer?.name;
            entityEmail = employer?.email;
          } else if (violation.entityType === "BOARD_MEMBER") {
            const boardMember = await prisma.boardMember.findUnique({
              where: { id: violation.entityId },
              select: { name: true },
            });
            entityName = boardMember?.name;
          } else if (violation.entityType === "LOBBYIST_REPORT") {
            const report = await prisma.lobbyistExpenseReport.findUnique({
              where: { id: violation.entityId },
              include: { Lobbyist: { select: { name: true } } },
            });
            entityName = report
              ? `${report.Lobbyist.name} - ${report.quarter} ${report.year}`
              : null;
          } else if (violation.entityType === "EMPLOYER_REPORT") {
            const report = await prisma.employerExpenseReport.findUnique({
              where: { id: violation.entityId },
              include: { Employer: { select: { name: true } } },
            });
            entityName = report
              ? `${report.Employer.name} - ${report.quarter} ${report.year}`
              : null;
          }
        } catch (error) {
          console.error(
            `Error fetching entity details for violation ${violation.id}:`,
            error
          );
        }

        // Map PascalCase relation name to camelCase for frontend compatibility
        return {
          ...violation,
          entityName,
          entityEmail,
          appeals: violation.Appeal, // Map Appeal to appeals for backwards compatibility
        };
      })
    );

    return NextResponse.json(enrichedViolations);
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
      sourceAlertId,
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
        sourceAlertId: sourceAlertId || null,
      },
    });

    // If violation was created from an alert, link them bidirectionally
    if (sourceAlertId) {
      await prisma.complianceAlert.update({
        where: { id: sourceAlertId },
        data: {
          resultingViolationId: violation.id,
          reviewedAt: new Date(), // Mark alert as reviewed
          reviewedBy: session.user.id,
        },
      });
    }

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
