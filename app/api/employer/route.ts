import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/employer - Get current user's employer profile
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employer = await prisma.employer.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employer);
  } catch (error) {
    console.error("Error fetching employer:", error);
    return NextResponse.json(
      { error: "Failed to fetch employer profile" },
      { status: 500 }
    );
  }
}
