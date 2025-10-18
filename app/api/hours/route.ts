import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getQuarterFromDate, getCurrentQuarter, getCurrentYear } from "@/lib/utils";

/**
 * GET /api/hours
 * Get hour logs for the authenticated lobbyist
 * Query params:
 *   - quarter: Quarter (optional)
 *   - year: number (optional)
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

    const searchParams = request.nextUrl.searchParams;
    const quarter = searchParams.get("quarter");
    const year = searchParams.get("year");

    const where: any = {
      lobbyistId: lobbyist.id,
    };

    // Filter by quarter and year if provided
    if (quarter) {
      where.quarter = quarter;
    }
    if (year) {
      where.year = parseInt(year);
    }

    const hourLogs = await prisma.hourLog.findMany({
      where,
      orderBy: {
        activityDate: "desc",
      },
    });

    return NextResponse.json(hourLogs);
  } catch (error) {
    console.error("Error fetching hour logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch hour logs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hours
 * Add a new hour log entry
 * Body:
 *   - activityDate: string (ISO date)
 *   - hours: number
 *   - description: string
 */
export async function POST(request: NextRequest) {
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
        { error: "Lobbyist profile not found. Please register as a lobbyist first." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { activityDate, hours, description } = body;

    // Validate required fields
    if (!activityDate || hours === undefined || !description) {
      return NextResponse.json(
        { error: "Missing required fields: activityDate, hours, description" },
        { status: 400 }
      );
    }

    // Validate hours is positive
    if (hours <= 0) {
      return NextResponse.json(
        { error: "Hours must be greater than 0" },
        { status: 400 }
      );
    }

    const date = new Date(activityDate);
    const quarter = getQuarterFromDate(date);
    const year = date.getFullYear();

    // Create hour log entry
    const hourLog = await prisma.hourLog.create({
      data: {
        lobbyistId: lobbyist.id,
        activityDate: date,
        hours,
        description,
        quarter,
        year,
      },
    });

    // Calculate total hours for current quarter
    const currentQuarter = getCurrentQuarter();
    const currentYear = getCurrentYear();

    const currentQuarterLogs = await prisma.hourLog.findMany({
      where: {
        lobbyistId: lobbyist.id,
        quarter: currentQuarter,
        year: currentYear,
      },
    });

    const totalHours = currentQuarterLogs.reduce((sum, log) => sum + log.hours, 0);

    // Update lobbyist's current quarter hours
    // Check if 10-hour threshold just exceeded
    const wasUnderThreshold = lobbyist.hoursCurrentQuarter < 10;
    const isNowOverThreshold = totalHours >= 10;

    const updateData: any = {
      hoursCurrentQuarter: totalHours,
    };

    // If threshold just exceeded, set deadline dates
    if (wasUnderThreshold && isNowOverThreshold && !lobbyist.thresholdExceededDate) {
      updateData.thresholdExceededDate = new Date();

      // Calculate 3 working days from now
      const today = new Date();
      const deadline = new Date(today);
      let daysAdded = 0;

      while (daysAdded < 3) {
        deadline.setDate(deadline.getDate() + 1);
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (deadline.getDay() !== 0 && deadline.getDay() !== 6) {
          daysAdded++;
        }
      }

      updateData.registrationDeadline = deadline;
    }

    await prisma.lobbyist.update({
      where: { id: lobbyist.id },
      data: updateData,
    });

    return NextResponse.json({
      hourLog,
      totalHours,
      thresholdExceeded: totalHours >= 10,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating hour log:", error);
    return NextResponse.json(
      { error: "Failed to create hour log" },
      { status: 500 }
    );
  }
}
