/**
 * POST /api/admin/alerts/generate
 * Generate new alerts by running detection rules
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateComplianceAlerts } from "@/lib/compliance/alert-generator";

/**
 * POST /api/admin/alerts/generate
 * Run alert detection rules and create new alerts (admin only)
 */
export async function POST() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alertsCreated = await generateComplianceAlerts();

    return NextResponse.json({
      success: true,
      alertsCreated,
      message: `Generated ${alertsCreated} new alert(s)`,
    });
  } catch (error) {
    console.error("Error generating alerts:", error);
    return NextResponse.json(
      { error: "Failed to generate alerts" },
      { status: 500 }
    );
  }
}
