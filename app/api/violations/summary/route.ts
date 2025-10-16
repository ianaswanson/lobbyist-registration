import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/violations/summary
 * Get summary statistics for violations
 * Returns:
 *   - totalViolations: number
 *   - activeViolations: number
 *   - totalFines: number
 *   - paidFines: number
 *   - pendingAppeals: number
 *   - averageFine: number
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can view violation summaries
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Count total violations
    const totalViolations = await prisma.violation.count();

    // Count active violations
    const activeViolations = await prisma.violation.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Count pending appeals
    const pendingAppeals = await prisma.appeal.count({
      where: {
        status: "PENDING",
      },
    });

    // Get all violations to calculate fine statistics
    const allViolations = await prisma.violation.findMany({
      select: {
        fineAmount: true,
        status: true,
      },
    });

    // Calculate total fines issued
    const totalFines = allViolations.reduce(
      (sum, v) => sum + (v.fineAmount || 0),
      0
    );

    // Calculate paid fines
    const paidFines = allViolations
      .filter((v) => v.status === "PAID")
      .reduce((sum, v) => sum + (v.fineAmount || 0), 0);

    // Calculate average fine
    const violationsWithFines = allViolations.filter(
      (v) => (v.fineAmount || 0) > 0
    );
    const averageFine =
      violationsWithFines.length > 0
        ? totalFines / violationsWithFines.length
        : 0;

    return NextResponse.json({
      totalViolations,
      activeViolations,
      totalFines,
      paidFines,
      pendingAppeals,
      averageFine: Math.round(averageFine * 100) / 100, // Round to 2 decimals
    });
  } catch (error) {
    console.error("Error fetching violation summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch violation summary" },
      { status: 500 }
    );
  }
}
