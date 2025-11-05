/**
 * PATCH /api/admin/alerts/[id]/review - Mark alert as reviewed
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/alerts/[id]/review
 * Mark a compliance alert as reviewed (dismiss it)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    // Mark alert as reviewed
    const alert = await prisma.complianceAlert.update({
      where: { id },
      data: {
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      alert,
      message: "Alert marked as reviewed",
    });
  } catch (error) {
    console.error("Error reviewing alert:", error);
    return NextResponse.json(
      { error: "Failed to review alert" },
      { status: 500 }
    );
  }
}
