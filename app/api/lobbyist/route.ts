import { NextRequest, NextResponse } from "next/server"
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
      include: {
        employers: {
          include: {
            employer: true,
          },
        },
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

// POST /api/lobbyist - Create or update lobbyist registration
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "LOBBYIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      hoursCurrentQuarter,
      employerName,
      employerEmail,
      employerPhone,
      employerAddress,
      employerBusinessDescription,
      subjectsOfInterest,
      authorizationDocuments,
    } = body

    // Validate required fields
    if (!name || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required lobbyist information" },
        { status: 400 }
      )
    }

    if (!employerName || !employerEmail) {
      return NextResponse.json(
        { error: "Missing required employer information" },
        { status: 400 }
      )
    }

    // Check if lobbyist already exists
    const existingLobbyist = await prisma.lobbyist.findUnique({
      where: { userId: session.user.id },
    })

    // Find or create employer
    let employer = await prisma.employer.findFirst({
      where: {
        OR: [
          { email: employerEmail },
          { name: employerName },
        ],
      },
    })

    if (!employer) {
      employer = await prisma.employer.create({
        data: {
          name: employerName,
          email: employerEmail,
          phone: employerPhone || "",
          address: employerAddress || "",
          businessDescription: employerBusinessDescription || "",
        },
      })
    }

    // Calculate threshold date and deadline if hours >= 10
    const thresholdExceededDate = hoursCurrentQuarter >= 10 ? new Date() : null
    const registrationDeadline = thresholdExceededDate
      ? new Date(thresholdExceededDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
      : null

    let lobbyist

    if (existingLobbyist) {
      // Update existing registration
      lobbyist = await prisma.lobbyist.update({
        where: { id: existingLobbyist.id },
        data: {
          name,
          email,
          phone,
          address,
          hoursCurrentQuarter,
          thresholdExceededDate,
          registrationDeadline,
          status: "PENDING", // Re-submit for review
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null,
        },
      })

      // Update employer relationship
      const existingRelationship = await prisma.lobbyistEmployer.findFirst({
        where: {
          lobbyistId: lobbyist.id,
          employerId: employer.id,
          endDate: null, // Only active relationships
        },
      })

      if (!existingRelationship) {
        await prisma.lobbyistEmployer.create({
          data: {
            lobbyistId: lobbyist.id,
            employerId: employer.id,
            subjectsOfInterest,
            authorizationDate: new Date(),
            // TODO: Add authorizationDocumentUrl from file upload
          },
        })
      } else {
        await prisma.lobbyistEmployer.update({
          where: { id: existingRelationship.id },
          data: {
            subjectsOfInterest,
            authorizationDate: new Date(),
          },
        })
      }
    } else {
      // Create new registration
      lobbyist = await prisma.lobbyist.create({
        data: {
          userId: session.user.id,
          name,
          email,
          phone,
          address,
          hoursCurrentQuarter,
          thresholdExceededDate,
          registrationDeadline,
          status: "PENDING", // Awaiting admin review
          employers: {
            create: {
              employerId: employer.id,
              subjectsOfInterest,
              authorizationDate: new Date(),
              // TODO: Add authorizationDocumentUrl from file upload
            },
          },
        },
      })
    }

    // TODO: Send email notification to admin about new registration
    // TODO: Send confirmation email to lobbyist

    return NextResponse.json(
      {
        message: existingLobbyist
          ? "Registration updated successfully! Your changes are pending admin review."
          : "Registration submitted successfully! Your registration is pending admin review.",
        lobbyist,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error creating/updating lobbyist:", error)
    return NextResponse.json(
      { error: "Failed to submit registration" },
      { status: 500 }
    )
  }
}
