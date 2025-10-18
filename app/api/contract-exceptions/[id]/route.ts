import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/contract-exceptions/[id] - Get single exception
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const isAdmin = session?.user?.role === "ADMIN"

    const exception = await prisma.contractException.findUnique({
      where: { id: params.id },
    })

    if (!exception) {
      return NextResponse.json(
        { error: "Exception not found" },
        { status: 404 }
      )
    }

    // Non-admins can only view publicly posted exceptions
    if (!isAdmin && !exception.publiclyPostedDate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(exception)
  } catch (error) {
    console.error("Error fetching contract exception:", error)
    return NextResponse.json(
      { error: "Failed to fetch contract exception" },
      { status: 500 }
    )
  }
}

// PATCH /api/contract-exceptions/[id] - Update exception (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      formerOfficialName,
      contractDescription,
      justification,
      approvedBy,
      approvedDate,
      publiclyPosted,
    } = body

    const updateData: any = {}

    if (formerOfficialName) updateData.formerOfficialName = formerOfficialName
    if (contractDescription) updateData.contractDescription = contractDescription
    if (justification) updateData.justification = justification
    if (approvedBy) updateData.approvedBy = approvedBy
    if (approvedDate) updateData.approvedDate = new Date(approvedDate)

    // Handle public posting
    if (publiclyPosted === true) {
      updateData.publiclyPostedDate = new Date()
    } else if (publiclyPosted === false) {
      updateData.publiclyPostedDate = null
    }

    const exception = await prisma.contractException.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(exception)
  } catch (error) {
    console.error("Error updating contract exception:", error)
    return NextResponse.json(
      { error: "Failed to update contract exception" },
      { status: 500 }
    )
  }
}

// DELETE /api/contract-exceptions/[id] - Delete exception (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.contractException.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contract exception:", error)
    return NextResponse.json(
      { error: "Failed to delete contract exception" },
      { status: 500 }
    )
  }
}
