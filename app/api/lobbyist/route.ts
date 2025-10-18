import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/lobbyist - Get current user's lobbyist profile
export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "LOBBYIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lobbyist = await prisma.lobbyist.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!lobbyist) {
      return NextResponse.json({ error: "Lobbyist profile not found" }, { status: 404 })
    }

    return NextResponse.json(lobbyist)
  } catch (error) {
    console.error("Error fetching lobbyist:", error)
    return NextResponse.json(
      { error: "Failed to fetch lobbyist profile" },
      { status: 500 }
    )
  }
}
