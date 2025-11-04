/**
 * GET /api/admin/alerts/counts - Get count of active alerts
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveAlertCounts } from "@/lib/compliance/alert-generator";

/**
 * GET /api/admin/alerts/counts
 * Get count of active alerts by severity (for navigation badge)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const counts = await getActiveAlertCounts();
    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error fetching alert counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert counts" },
      { status: 500 }
    );
  }
}
