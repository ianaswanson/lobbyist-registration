import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { RegistrationStatus } from "@prisma/client"

/**
 * GET /api/admin/registrations
 * Get all pending lobbyist registrations for admin review
 */
export async function GET(req: Request) {
  try {
    // 1. Check authentication and admin role
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "PENDING"

    // 3. Fetch registrations
    const registrations = await prisma.lobbyist.findMany({
      where: {
        status: status as RegistrationStatus,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        employers: {
          include: {
            employer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Oldest first
      },
    })

    // 4. Return registrations
    return NextResponse.json({
      registrations,
      count: registrations.length,
    })
  } catch (error) {
    console.error("Error fetching lobbyist registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}
