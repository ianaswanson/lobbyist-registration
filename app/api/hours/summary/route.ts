import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCurrentQuarter, getCurrentYear, getQuarterStartDate, getQuarterEndDate } from "@/lib/utils";

/**
 * GET /api/hours/summary
 * Get quarterly hour summary for the authenticated lobbyist
 * Returns total hours for current quarter and threshold status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get lobbyist record for this user
    const lobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    });

    if (!lobbyist) {
      return NextResponse.json(
        { error: "Lobbyist profile not found" },
        { status: 404 }
      );
    }

    const currentQuarter = getCurrentQuarter();
    const currentYear = getCurrentYear();

    // Get all hour logs for current quarter
    const currentQuarterLogs = await prisma.hourLog.findMany({
      where: {
        lobbyistId: lobbyist.id,
        quarter: currentQuarter,
        year: currentYear,
      },
      orderBy: {
        activityDate: "desc",
      },
    });

    const totalHours = currentQuarterLogs.reduce((sum, log) => sum + log.hours, 0);

    // Get quarter boundaries
    const quarterStart = getQuarterStartDate(currentQuarter, currentYear);
    const quarterEnd = getQuarterEndDate(currentQuarter, currentYear);

    // Calculate days remaining in quarter
    const now = new Date();
    const daysRemaining = Math.ceil((quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      quarter: currentQuarter,
      year: currentYear,
      quarterStart,
      quarterEnd,
      daysRemaining,
      totalHours,
      thresholdExceeded: totalHours >= 10,
      hoursUntilThreshold: Math.max(0, 10 - totalHours),
      registrationRequired: totalHours >= 10,
      thresholdExceededDate: lobbyist.thresholdExceededDate,
      registrationDeadline: lobbyist.registrationDeadline,
      registrationStatus: lobbyist.status,
      recentLogs: currentQuarterLogs.slice(0, 5), // Last 5 entries
    });
  } catch (error) {
    console.error("Error fetching hour summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch hour summary" },
      { status: 500 }
    );
  }
}
