/**
 * GET /api/admin/alerts - List active compliance alerts
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getActiveAlertCounts } from "@/lib/compliance/alert-generator";

/**
 * GET /api/admin/alerts
 * List all active compliance alerts (admin only)
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const type = searchParams.get("type");
    const includeReviewed = searchParams.get("includeReviewed") === "true";

    // Build where clause
    const where: any = {};

    if (!includeReviewed) {
      where.reviewedAt = null;
    }

    if (severity) {
      where.severity = severity.toUpperCase();
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    // Get alerts with pagination
    const alerts = await prisma.complianceAlert.findMany({
      where,
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      take: 100, // Limit to 100 most recent
    });

    // Get alert counts
    const counts = await getActiveAlertCounts();

    return NextResponse.json({
      alerts,
      counts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

