import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contract-exceptions - List all contract exceptions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Public can view exceptions (transparency requirement)
    // But we'll return more details for admins
    const isAdmin = session?.user?.role === "ADMIN";

    const searchParams = request.nextUrl.searchParams;
    const includeUnposted = searchParams.get("includeUnposted") === "true";

    // Build query
    const where: any = {};

    // Non-admins can only see publicly posted exceptions
    if (!isAdmin || !includeUnposted) {
      where.publiclyPostedDate = {
        not: null,
      };
    }

    const exceptions = await prisma.contractException.findMany({
      where,
      orderBy: {
        approvedDate: "desc",
      },
    });

    return NextResponse.json(exceptions);
  } catch (error) {
    console.error("Error fetching contract exceptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch contract exceptions" },
      { status: 500 }
    );
  }
}

// POST /api/contract-exceptions - Create new exception (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      formerOfficialId,
      formerOfficialName,
      contractDescription,
      justification,
      approvedBy,
      approvedDate,
      publiclyPosted,
    } = body;

    // Validate required fields
    if (
      !formerOfficialId ||
      !formerOfficialName ||
      !contractDescription ||
      !justification ||
      !approvedBy ||
      !approvedDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exception = await prisma.contractException.create({
      data: {
        formerOfficialId,
        formerOfficialName,
        contractDescription,
        justification,
        approvedBy,
        approvedDate: new Date(approvedDate),
        publiclyPostedDate: publiclyPosted ? new Date() : null,
      },
    });

    return NextResponse.json(exception, { status: 201 });
  } catch (error) {
    console.error("Error creating contract exception:", error);
    return NextResponse.json(
      { error: "Failed to create contract exception" },
      { status: 500 }
    );
  }
}
