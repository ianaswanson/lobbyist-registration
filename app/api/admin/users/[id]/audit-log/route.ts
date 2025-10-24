/**
 * API Route: User Audit Log History
 * GET /api/admin/users/[id]/audit-log - Get user's audit trail
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserAuditHistory } from "@/lib/user-audit";

/**
 * GET /api/admin/users/[id]/audit-log
 * Get complete audit history for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication and authorization
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // 2. Await params (Next.js 15)
    const { id } = await params;

    // 3. Fetch audit log history
    const auditLog = await getUserAuditHistory(id);

    // 4. Return audit history
    return NextResponse.json({
      auditLog,
      total: auditLog.length,
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
